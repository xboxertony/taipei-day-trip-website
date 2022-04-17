from flask import *
import bcrypt
from db_connection import connection_pool, cursor, db
import jwt
from datetime import timedelta, datetime
from api.orders import get_member_id

user = Blueprint("user", __name__)


@user.route("/api/user", methods=["GET", "POST", "PATCH", "DELETE"])
def auth():
    if request.method == "GET":
        if not request.cookies.get("cookie"):
            return jsonify(None)
        else:
            cookie = request.cookies.get("cookie")
            try:
                decode_jwt = jwt.decode(
                    cookie, current_app.config["SECRET_KEY"], algorithms="HS256"
                )
                id = decode_jwt["data"]["id"]
                email = decode_jwt["data"]["email"]
                name = decode_jwt["data"]["name"]
                resp = {"data": {"id": id, "name": name, "email": email}}
                return jsonify(resp)
            except jwt.ExpiredSignatureError:
                return jsonify(None)
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
                token = jwt.encode(
                    {
                        "data": {
                            "id": member["id"],
                            "name": member["name"],
                            "email": member["email"],
                        },
                        "exp": datetime.utcnow() + timedelta(hours=24),
                    },
                    current_app.config["SECRET_KEY"],
                    algorithm="HS256",
                )
                result = jsonify({"ok": True})
                response = make_response(result)
                response.set_cookie(
                    "cookie", token, expires=datetime.utcnow() + timedelta(hours=24)
                )
                return response
        except Exception as e:
            print(e)
            return jsonify({"error": True, "message": "伺服器錯誤"}), 500
    if request.method == "DELETE":
        result = jsonify({"ok": True})
        response = make_response(result)
        response.set_cookie("cookie", expires=0)
        return response


@user.route("/api/user/password", methods=["PATCH"])
def edit_password():
    if not request.cookies.get("cookie"):
        error = {"error": True, "message": "未登入系統，拒絕存取"}
        return jsonify(error), 403
    if request.method == "PATCH":
        member_id = get_member_id(request)
        password = request.get_json()["password"]
        new_password = request.get_json()["newPassword"]
        double_check_password = request.get_json()["doubleCheckPassword"]
        if not password or not new_password or not double_check_password:
            return jsonify({"error": True, "message": "輸入欄位請勿空白"}), 400
        if is_password(member_id, password) is False:
            return jsonify({"error": True, "message": "原密碼錯誤"}), 400
        elif new_password == double_check_password:
            update_password(new_password, member_id)
            return jsonify({"ok": True})
        else:
            return jsonify({"error": True, "message": "確認新密碼不相符"}), 400


@user.route("/api/user/contact", methods=["GET", "PATCH"])
def edit_contact():
    if not request.cookies.get("cookie"):
        error = {"error": True, "message": "未登入系統，拒絕存取"}
        return jsonify(error), 403

    if request.method == "GET":
        member_id = get_member_id(request)
        contact_data = get_contact(member_id)
        contact = {
            "contact": {
                "name": contact_data[0],
                "email": contact_data[1],
                "phone": contact_data[2],
            }
        }
        return jsonify(contact)

    if request.method == "PATCH":
        member_id = get_member_id(request)
        contact_name = request.get_json()["name"]
        contact_email = request.get_json()["email"]
        contact_phone = request.get_json()["phone"]
        if not contact_name or not contact_email or not contact_phone:
            return jsonify({"error": True, "message": "輸入欄位請勿空白"}), 400
        else:
            update_contact(contact_name, contact_email, contact_phone, member_id)
            return jsonify({"ok": True})


def update_contact(name, email, phone, id):
    sql = "update member set contact_name=%s, contact_email=%s, contact_phone=%s where id = %s"
    db = connection_pool.get_connection()
    cursor = db.cursor()
    cursor.execute(sql, (name, email, phone, id))
    db.commit()
    cursor.close()
    db.close()


def get_contact(member_id):
    sql = "select contact_name, contact_email, contact_phone from member where id =%s"
    db = connection_pool.get_connection()
    cursor = db.cursor()
    cursor.execute(sql, (member_id,))
    infos = cursor.fetchone()
    cursor.close()
    db.close()
    return infos


def is_password(member_id, password):
    sql = "select password from member where id = %s"
    db = connection_pool.get_connection()
    cursor = db.cursor()
    cursor.execute(sql, (member_id,))
    result = False
    for hashed in cursor:
        if bcrypt.checkpw(password.encode("utf-8"), hashed[0].encode()):
            result = True
        else:
            result = False
    cursor.close()
    db.close()
    return result


def update_password(new_password, member_id):
    hashed = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())
    sql = "update member set password= %s where id = %s"
    db = connection_pool.get_connection()
    cursor = db.cursor()
    cursor.execute(sql, (hashed, member_id))
    db.commit()
    cursor.close()
    db.close()


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
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    insert_user_ssql = "INSERT INTO member (name, email, password) VALUES (%s, %s, %s)"
    db = connection_pool.get_connection()
    cursor = db.cursor()
    cursor.execute(insert_user_ssql, (name, email, hashed))
    db.commit()
    cursor.close()
    db.close()


def authenticate_member(email, password):
    check_member_sql = "SELECT id, name, email, password FROM member WHERE email = %s"
    db = connection_pool.get_connection()
    cursor = db.cursor()
    cursor.execute(check_member_sql, (email,))
    result = False
    for id, name, email, hashed in cursor:
        if bcrypt.checkpw(password.encode("utf-8"), hashed.encode()):
            result = {"id": id, "email": email, "name": name}
        else:
            result = False
    db.close()
    return result
