from flask import *
from db_connection import connection_pool, cursor, db

user = Blueprint("user", __name__)


def is_email(email):
    is_email_sql = "select email from member where email = %s"
    db = connection_pool.get_connection()
    cursor = db.cursor()
    cursor.execute(is_email_sql, (email,))
    result = False
    for email in cursor:
        result = True
    cursor.close()
    db.close()
    return result


def sign_up(name, email, password):
    insert_user_ssql = "INSERT INTO member (name, email, password) VALUES (%s, %s, %s)"
    db = connection_pool.get_connection()
    cursor = db.cursor()
    # row_count = cursor.rowcount
    cursor.execute(insert_user_ssql, (name, email, password))
    db.commit()
    cursor.close()
    db.close()


def authenticate_member(email, member_password):
    check_member_sql = "SELECT id,name, email, password FROM member WHERE email = %s"
    db = connection_pool.get_connection()
    cursor = db.cursor()
    cursor.execute(check_member_sql, (email,))
    result = False
    for id, name, email, passsword in cursor:
        if member_password == passsword:
            result = {"id": id, "email": email, "name": name}
        else:
            result = False
    db.close()
    return result


@user.route("/api/user", methods=["GET", "POST", "PATCH", "DELETE"])
def auth():
    if request.method == "GET":
        id = session.get("id")
        email = session.get("email")
        name = session.get("name")
        if not id or not email or not name:
            return jsonify(None)
        else:
            data = {"id": id, "name": name, "email": email}
            return jsonify(data)
    if request.method == "POST":
        try:
            name = request.get_json()["name"]
            email = request.get_json()["email"]
            password = request.get_json()["password"]
            if not name or not email or not password:
                return jsonify({"error": True, "message": "輸入欄請勿空白"}), 400
            if is_email(email):
                return jsonify({"error": True, "message": "Email已存在"}), 400
            else:
                sign_up(name, email, password)
                return jsonify({"ok": True})
        except:
            return jsonify({"error": True, "message": "伺服器錯誤"}), 500
    if request.method == "PATCH":
        try:
            email = request.get_json()["email"]
            password = request.get_json()["password"]
            if not email or not password:
                return jsonify({"error": True, "message": "輸入欄請勿空白"}), 400
            member = authenticate_member(email, password)
            if member is False:
                return jsonify({"error": True, "message": "帳號密碼錯誤"}), 400
            else:
                session["id"] = member["id"]
                session["name"] = member["name"]
                session["email"] = member["email"]
                return jsonify({"ok": True})
        except:
            return jsonify({"error": True, "message": "伺服器錯誤"}), 500
    if request.method == "DELETE":
        session.clear()
        return jsonify({"ok": True})
