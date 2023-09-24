from flask import Blueprint, render_template
from server.department.department import Department
from server.user import User
from server.database import DatabaseController
import json

blueprint = Blueprint("registration", __name__, url_prefix="/register")


@blueprint.route("/")
def register():
    """Return the registration page"""
    users = DatabaseController.get().fetch_all_users()
    user_list = [User.to_http_json(user) for user in users]
    user_data = json.dumps({"departments": user_list})
    departments = DatabaseController.get().fetch_all_departments().values()
    department_list = [
        Department.to_http_json(department) for department in departments
    ]
    department_data = json.dumps({"departments": department_list})
    return render_template(
        "register.j2", userData=user_data, departmentData=department_data
    )


@blueprint.route("/add_user")
def add_user():
    """Return the add user page page"""
    departments = DatabaseController.get().fetch_all_departments().values()
    department_list = [
        Department.to_http_json(department) for department in departments
    ]
    department_data = json.dumps({"departments": department_list})
    return render_template("add_user.j2", departmentData=department_data)


@blueprint.route("/add_department")
def add_department():
    """Return the add department page"""
    return render_template("add_department.j2")
