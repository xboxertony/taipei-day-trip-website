from select import select
from flask import *
from api.api import api
from db_connection import connection_pool, db, cursor
import os


app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config["JSON_SORT_KEYS"] = False
app.config["SECRET_KEY"] = os.urandom(24)

app.register_blueprint(api)

# functions


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


# Pages
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/attraction/<id>")
def attraction(id):
    return render_template("attraction.html")


@app.route("/booking")
def booking():
    return render_template("booking.html")


@app.route("/thankyou")
def thankyou():
    return render_template("thankyou.html")


@app.route("/api/user", methods=["GET", "POST", "PATCH", "DELETE"])
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
        name = request.form.get("name")
        email = request.form.get("email")
        password = request.form.get("password")
        print(name, email, password)
        if not name:
            return jsonify({"error": True, "message": "請輸入姓名"}), 400
        if not email:
            return jsonify({"error": True, "message": "請輸入Email"}), 400
        if not password:
            return jsonify({"error": True, "message": "請輸入密碼"}), 400
        if is_email(email):
            return jsonify({"error": True, "message": "email已存在"}), 400
        else:
            sign_up(name, email, password)
            return jsonify({"ok": True})
    if request.method == "PATCH":
        email = request.form.get("email")
        password = request.form.get("password")
        if not email:
            return jsonify({"error": True, "message": "請輸入Email"}), 400
        if not password:
            return jsonify({"error": True, "message": "請輸入密碼"}), 400
        member = authenticate_member(email, password)
        if member is False:
            return jsonify({"error": True, "message": "帳號密碼錯誤"}), 400
        else:
            session["id"] = member["id"]
            session["name"] = member["name"]
            session["email"] = member["email"]
            return jsonify({"ok": True})
    if request.method == "DELETE":
        session.clear()
        return jsonify({"ok": True})


app.run(port=3000, debug=True)
