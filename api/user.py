from flask import *
import bcrypt
from db_connection import connection_pool, cursor, db
import jwt
from datetime import timedelta, datetime


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
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    insert_user_ssql = "INSERT INTO member (name, email, password) VALUES (%s, %s, %s)"
    db = connection_pool.get_connection()
    cursor = db.cursor()
    cursor.execute(insert_user_ssql, (name, email, hashed))
    db.commit()
    cursor.close()
    db.close()


def authenticate_member(email, password):
    check_member_sql = "SELECT id,name, email, password FROM member WHERE email = %s"
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
