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
    departments = DatabaseController.get().fetch_all_departments(fetch_list=True)
    department_list = [
        Department.to_http_json(department) for department in departments
    ]
    department_data = json.dumps({"departments": department_list})
    return render_template(
        "register.j2", userData=user_data, departmentData=department_data
    )
