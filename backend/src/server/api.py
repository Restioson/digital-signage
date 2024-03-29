from http import HTTPStatus
import json
import pandas as pd
import flask
import zipfile
import PIL.Image
import io
from flask import Blueprint, Response, redirect, url_for, current_app, render_template
from flask_login import (
    login_user,
    logout_user,
    current_user,
)
from server import free_form_content
from server.department.department import Department
from server.user import User
from server.database import DatabaseController
from server.department.file import File
from server.department.person import Person
from server.display import Display
from server.free_form_content import BinaryContent
from server.free_form_content.content_stream import ContentStream


blueprint = Blueprint("api", __name__, url_prefix="/api")


@blueprint.route("/loadshedding_schedule", methods=["GET"])
def loadshedding():
    """
    Returns the stored loadshedding schedule
    Right now it is locked to the region of UCT
    """
    try:
        schedule_data = DatabaseController.get().fetch_loadshedding_schedule(1)
        schedule_json = json.dumps(schedule_data, indent=4)
        response = Response(schedule_json, content_type="application/json")
        if schedule_json:
            return response
        else:
            return flask.abort(500)
    except Exception:
        return flask.abort(500)


@blueprint.route("/health", methods=["GET"])
def health():
    """The health check endpoint.

    This returns whether the server is healthy.
    """

    return {"healthy": True}


@blueprint.route("/content_streams", methods=["POST", "GET"])
def list_content_streams():
    """The /api/content_streams endpoint.

    POSTing to this endpoint with a form representing a new content stream
    will create the content stream and return its id.
    """
    db = DatabaseController.get()

    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()
    # the check above is to check the user is logged in and such
    # this check is apart of the majority of the API checks for security
    stream_id = db.create_content_stream(ContentStream.from_form(flask.request.form))

    return {"id": stream_id}


@blueprint.route("/departments", methods=["GET"])
def list_departments():
    """The /api/departments endpoint.
    GETting this endpoint returns the list of departments with their IDs in json form
    """
    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()
    departments = DatabaseController.get().fetch_all_departments().values()
    department_list = [
        Department.to_http_json(department) for department in departments
    ]
    return {"departments": department_list}


@blueprint.route("/users", methods=["GET"])
def list_users():
    """The /api/users endpoint.
    GETting this endpoint returns the list of users
    with their emails and usernames in json form
    """
    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()
    if current_user.permissions != "superuser":
        flask.abort(401)
    users = DatabaseController.get().fetch_all_users()
    user_list = [User.to_http_json(user) for user in users]
    response_data = json.dumps({"departments": user_list})

    return Response(response_data, content_type="application/json")


@blueprint.route("/content", methods=["POST", "GET"])
def content():
    """The /api/content endpoint.

    GETting this endpoint will return a list of all the content in the given streams
    (which are given by query parameters) in the reverse order of posting
    (most recent to least recent). Binary blobs will not be fetched and must be
    fetched separately using the /api/content/<id>/blob endpoint.

    POSTing to this endpoint with a form representing a new content post will create
    the post in the given stream and return the ID and post time upon success.
    """
    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()
    streams = flask.request.args.getlist("stream")
    limit = int(last if (last := flask.request.args.get("last")) else 0) or None

    if flask.request.method == "GET":
        return {
            "content": [
                post.to_http_json()
                for post in DatabaseController.get().fetch_content_in_streams(
                    streams, limit=limit
                )
            ]
        }
    elif flask.request.method == "POST":
        if not current_user.is_authenticated:
            return current_app.login_manager.unauthorized()

        content_id, posted = DatabaseController.get().post_content(
            free_form_content.from_form(flask.request.form, flask.request.files)
        )

        return {"id": content_id, "posted": posted}


@blueprint.route("/departments/<int:department_id>/people", methods=["POST", "GET"])
def people_route(department_id: int):
    """The /api/departments/<id>/people end point
    GETing this endpoint fetches all the departments people from the database

    POSTing to this end point inserts a new person into the database
    """

    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()

    dept = DatabaseController.get().fetch_department_by_id(
        department_id, fetch_people=True
    )

    if not dept:
        return flask.abort(404)

    if flask.request.method == "GET":
        return {"people": [person.to_http_json() for person in dept.people]}
    else:
        if not current_user.is_authenticated:
            return current_app.login_manager.unauthorized()

        person_id = DatabaseController.get().upsert_person(
            Person.from_form(flask.request.form, flask.request.files), department_id
        )

        return {"id": person_id}


@blueprint.route(
    "/departments/<int:department_id>/people/<int:person_id>", methods=["DELETE"]
)
def person(department_id: int, person_id: int):
    """The /api/departments/<dept_id>/people/<id> endpoint.

    DELETEing this endpoint deletes the given person in the database.
    """
    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()
    if current_user.permissions != "superuser":
        flask.abort(401)
    if not DatabaseController.get().fetch_department_by_id(
        department_id, fetch_people=True
    ):
        flask.abort(404)

    if DatabaseController.get().delete_person(person_id):
        return {"deleted": True}
    else:
        return flask.abort(404)


@blueprint.route(
    "/departments/<int:department_id>/people/<int:person_id>/image", methods=["GET"]
)
def person_image(department_id: int, person_id: int):
    """Fetch the image of a person"""
    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()
    image_data = DatabaseController.get().fetch_person_image_by_id(person_id)
    if image_data:
        mime_type = image_data[0]
        blob = image_data[1]
        return Response(response=blob, mimetype=mime_type, status=HTTPStatus.OK)
    else:
        return flask.abort(404)


def open_empty_zip_file():
    """
    This is not an API call but a function which returns an empty zipfile
    """
    with open("backend/src/server/EmptyZip.zip", "rb") as zip_file:
        zip_contents = zip_file.read()
    return zipfile.ZipFile(io.BytesIO(zip_contents), "r")


def create_person(row, zip_file):
    """
    This is not an API call but a function which takes the row of a form
    and a zipfile and returns a person object
    """
    # makes the attributes of the person from the row.
    # As the user may be able to not enter certain attributes
    # of the person this accounts for that
    title = row["title"] if not pd.isna(row["title"]) else ""
    full_name = row["full_name"] if not pd.isna(row["full_name"]) else ""
    position = row["position"] if not pd.isna(row["position"]) else ""
    office_hours = row["office_hours"] if not pd.isna(row["office_hours"]) else ""
    office_location = (
        row["office_location"] if not pd.isna(row["office_location"]) else ""
    )
    email = row["email"] if not pd.isna(row["email"]) else ""
    phone = row["phone"] if not pd.isna(row["phone"]) else ""
    try:
        # this tries to find the image of the person
        # from the uploaded ZIP file if there is one
        with zip_file.open(row["image_name"]) as image_file:
            image_data = image_file.read()
            image = PIL.Image.open(io.BytesIO(image_data))
            image.verify()
            mime_type = image.get_format_mimetype()
    except Exception:
        image_data = ""
        mime_type = ""
    person = Person(
        title,
        full_name,
        mime_type,
        image_data,
        position,
        office_hours,
        office_location,
        email,
        phone,
    )
    return person


@blueprint.route("/departments/<int:department_id>/uploadtable", methods=["POST"])
def upload_table(department_id: int):
    """
    The /api/departments/<dept_id>/upload_table endpoint.
    POSTing this endpoint uploads the posted table to its database
    """
    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()
    if current_user.permissions == "posting_user":
        flask.abort(401)
    try:
        try:
            zip_file = zipfile.ZipFile(flask.request.files["images_folder"], "r")
        except Exception:
            # If it fails, load an empty zip file from the server
            zip_file = open_empty_zip_file()

        excel_file = flask.request.files["add_table"]
        df = pd.read_excel(excel_file, engine="openpyxl")
        people = [create_person(row, zip_file) for index, row in df.iterrows()]

        # Separate loops so that any error in the whole table
        # is caught before any entry is added
        # loop through people to add each to the table
        db = DatabaseController.get()
        for person in people:
            db.upsert_person(person, department_id)
        return {
            "id": "response needed",
            "response": "Excel file is a valid file. Upload successful",
        }
    except Exception:
        return flask.abort(400)


@blueprint.route("/register", methods=["POST"])
def registration_route():
    """
    The /api/register endpoint.
    POSTing this endpoint registers a new user
    """
    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()
    if current_user.permissions != "superuser":
        flask.abort(401)
    form = flask.request.form

    if flask.request.method == "POST":
        department = form["department"]
        permissions = form["permissions"]
        # The department 1 is the admin department and
        # every member of the admin department is made automatically a super user
        if department == "1":
            permissions = "superuser"
        elif permissions == "superuser":
            department = "1"

        if form["email"] and not DatabaseController.get().user_exists(form["email"]):
            DatabaseController.get().insert_user(
                form["email"],
                form["screen_name"],
                form["password"],
                department,
                permissions,
            )

            return {
                "id": "response needed",
                "response": "User " + form["screen_name"] + " has been created",
            }

        else:
            flask.abort(401)


@blueprint.route("/login", methods=["POST"])
def login_route():
    """
    The /api/login endpoint.
    POSTing this endpoint logs in the user
    """
    form = flask.request.form
    if DatabaseController.get().user_exists(form["email"]):
        user = DatabaseController.get().try_login(form["email"], form["password"])
        if user:
            login_user(user)
            return flask.redirect(flask.url_for("config_view.list_departments"))
        else:
            attemp = "password"
            return render_template(
                "login.j2",
                attempt=attemp,
            )
    else:
        attemp = "email"
        return render_template(
            "login.j2",
            attempt=attemp,
        )


@blueprint.route("/logout", methods=["GET"])
def logout_route():
    """
    The /api/logout endpoint.
    GETting this endpoint logs out the user
    """
    logout_user()
    return redirect(url_for("login.login"))


@blueprint.route("/content/<int:content_id>", methods=["DELETE"])
def delete_content(content_id: int):
    """
    The /api/content/<int:content_id> endpoint.
    DELETEing this endpoint delete the given piece of content
    """
    if DatabaseController.get().delete_content_by_id(content_id):
        return {"deleted": True}
    else:
        flask.abort(404)


@blueprint.route("/departments", methods=["POST"])
def create_department():
    """
    The /api/departments endpoint.
    POSTing this endpoint creates a new department
    """
    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()
    if current_user.permissions != "superuser":
        flask.abort(401)
    # check if department already exists
    name = flask.request.form["name"]
    if DatabaseController.get().check_department(name):
        return flask.abort(400)
    else:
        # if not make department
        DatabaseController.get().create_new_department(name)
        return {
            "id": "response needed",
            "response": "Department created",
        }


@blueprint.route("/departments/<int:department_id>", methods=["DELETE"])
def delete_department(department_id: int):
    """DELETEing this endpoint deletes the given department"""

    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()
    if current_user.permissions != "superuser":
        flask.abort(401)

    if DatabaseController.get().delete_department(department_id):
        return {"deleted": True}
    else:
        return flask.abort(404)


@blueprint.route("/user/<string:user_id>", methods=["DELETE"])
def delete_user(user_id: str):
    """DELETEing this endpoint deletes the given user"""

    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()
    if current_user.permissions != "superuser":
        flask.abort(401)

    if DatabaseController.get().delete_user(user_id):
        return {"deleted": True}
    else:
        return flask.abort(404)


@blueprint.route("/content/<int:content_id>/blob", methods=["GET"])
def content_blob(content_id: int):
    """Fetch the blob (Binary Large OBject) associated with the given content.

    Returns 404 if the content is not BinaryContent.
    """
    post = DatabaseController.get().fetch_content_by_id(content_id, fetch_blob=True)

    if isinstance(post, BinaryContent):
        return Response(
            response=post.blob, mimetype=post.mime_type, status=HTTPStatus.OK
        )
    else:
        flask.abort(404)


@blueprint.route("/departments/<int:department_id>/displays", methods=["POST"])
def displays(department_id: int):
    """
    The /api/departments/<int:department_id>/displays endpoint.
    POSTing this endpoint creates a new display for that department
    """
    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()
    if current_user.permissions == "posting_user":
        flask.abort(401)
    db = DatabaseController.get()
    display_id = db.upsert_display(
        Display.from_form(department_id, flask.request.form, flask.request.files, db),
        department_id,
    )
    return {"id": display_id}


@blueprint.route(
    "/departments/<int:department_id>/displays/<int:display_id>", methods=["DELETE"]
)
def delete_display(department_id: int, display_id: int):
    """DELETEing this endpoitn deletes the given display"""

    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()
    if current_user.permissions == "posting_user":
        return flask.abort(401)

    if DatabaseController.get().delete_display(department_id, display_id):
        return {"deleted": True}
    else:
        return flask.abort(500)


@blueprint.route("/departments/<int:department_id>/preview_display", methods=["POST"])
def preview_display(department_id: int):
    """Preview the given display without actually creating it"""

    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()

    db = DatabaseController.get()
    display = Display.from_form(
        department_id,
        flask.request.form,
        flask.request.files,
        db,
        preview_pages=flask.request.args.getlist("preview_page", type=int) or [],
    )
    return render_template(
        "display.j2",
        display_config={
            "department": department_id,
            "layout": display.render(db),
            "displayContentStream": display.content_stream,
        },
    )


@blueprint.route("/department/<int:department_id>/files", methods=["POST", "GET"])
def upload_department_files(department_id: int):
    """The /api/department/files endpoint.

    POSTing to this endpoint with a form representing a new file post will add a
    file to the server and return the ID and post time upon success.
    """

    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()

    content_id = DatabaseController.get().upload_department_file(
        File.from_form(flask.request.form, flask.request.files, department_id)
    )

    return {"id": content_id}


@blueprint.route(
    "/department/<int:department_id>/<int:display>/<string:filename>",
    methods=["GET"],
)
def get_department_files(filename: str, department_id: int):
    """The /api/department/<int:department_id>/<int:display>/<string:filename> endpoint.

    POSTing to this endpoint well fetch files from the server
    dependant on the file name and department
    """
    department_file = DatabaseController.get().fetch_file_by_id(filename, department_id)

    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()
    if department_file:
        return Response(
            response=department_file.file_data,
            mimetype=department_file.mime_type,
            status=HTTPStatus.OK,
        )
    else:
        flask.abort(404)


@blueprint.route(
    "/departments/<int:department_id>/files/<string:file_name>",
    methods=["DELETE", "GET"],
)
def file(department_id: int, file_name: str):
    """The /api/departments/<int:department_id>/files/<string:file_name> endpoint.

    GETting from this endpoint well fetch a file from the server
    dependant on the file name and department
    DELETEing this endpoint will delete a file from the server
    dependant on the file name and department
    """
    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()

    if not DatabaseController.get().fetch_department_by_id(department_id):
        flask.abort(404)

    if flask.request.method == "DELETE":
        if DatabaseController.get().delete_file_by_name_and_department(
            file_name, department_id
        ):
            return {"deleted": True}
        else:
            flask.abort(404)
    else:
        file = DatabaseController.get().fetch_file_by_id(file_name, department_id)

        if isinstance(file, File):
            return Response(
                response=file.file_data, mimetype=file.mime_type, status=HTTPStatus.OK
            )
        else:
            flask.abort(404)
