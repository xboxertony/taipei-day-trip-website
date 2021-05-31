from flask import Blueprint,request,jsonify,session
from main import db
import re

user_app = Blueprint("user_app",__name__)

@user_app.route("/api/user",methods=["GET","POST","PATCH","DELETE"])
def user():
	if request.method=="POST":
		try:
			regex = r".+@.+"
			data = request.get_json()
			name = data["name"]
			email = data["email"]
			password = data["password"]
			sql = f"select email from user where email='{email}'"
			replicate = db.engine.execute(sql)
			for i in replicate:
				return jsonify({"error":True,"message":"註冊失敗，重複的email"}),400
			if not name or not email or not password:
				return jsonify({"error":True,"message":"註冊失敗，欄位不可以為空"}),400
			if not re.findall(regex,email) or not re.findall(regex,email)[0]==email:
				return jsonify({"error":True,"message":"註冊失敗，email格式錯誤"}),400
			sql = f"insert into user (name,email,password) values ('{name}','{email}','{password}')"
			db.engine.execute(sql)
			return jsonify({"ok":True})
		except:
			return jsonify({"error":True,"message":"伺服器內部錯誤"}),500
	if request.method=="PATCH":
		try:
			data = request.get_json()
			email = data["email"]
			password = data["password"]
			sql = f"select id,name,email from user where email='{email}' and password='{password}'"
			result = db.engine.execute(sql)
			for i in result:
				print(i)
				session["id"]=i[0]
				session["name"]=i[1]
				session["email"]=i[2]
				session.permanent = True
				return jsonify({"ok":True})
			return jsonify({"error":True,"message":"登入失敗，帳號或密碼錯誤"}),400
		except:
			return jsonify({"error":True,"message":"伺服器內部錯誤"}),500
	if request.method=="DELETE":
		if "id" in session:
			session.pop("id")
		if "FB" in session:
			session.pop("FB")
			session.pop("FB_ID")
			session.pop("url")
		session.pop("name")
		if "email" in session:
			session.pop("email")
		if "google" in session:
			session.pop("google")
		return jsonify({"ok":True})
	if request.method=="GET":
		print(session)
		if "name" in session:
			return jsonify({"data":{
				"id":session.get("id"),
				"name":session.get("name"),
				"email":session.get("email")
				}
			})
		else:
			return jsonify({"data":None}) 


@user_app.route("/api/google/user",methods=["PATCH"])
def google():
	if request.method == "PATCH":
		session["google"]="google"
		session["name"]=request.get_json()["name"]
		session["email"]=request.get_json()["email"]
		session.permanent = True
		return jsonify({"ok":True})

@user_app.route("/api/FB/user",methods=["PATCH"])
def FB():
	if request.method == "PATCH":
		session["FB"]="FB"
		session["name"]=request.get_json()["name"]
		session["FB_ID"]=request.get_json()["FB_ID"]
		session["email"]=request.get_json()["email"]
		session["url"]=request.get_json()["url"]
		session.permanent = True
		return jsonify({"ok":True})