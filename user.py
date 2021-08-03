from datetime import datetime
import email
from operator import truth
from flask import Blueprint,request,jsonify,session,render_template,url_for
from flask.helpers import url_for
from werkzeug.utils import redirect
from main import db,mail,s,db_RDS
import re
from flask_mail import Message
from config import mail_username,password_key
import jwt
from main import bcrypt

user_app = Blueprint("user_app",__name__)

@user_app.route("/api/reset_password",methods=["POST"])
def reset_password():
	data = request.get_json()
	# password =  jwt.encode({"password":data["password"]},password_key,algorithm="HS256").decode("utf-8")
	password = bcrypt.generate_password_hash(data["password"]).decode('utf8')
	email = data['email']
	sql = f"UPDATE attraction.user SET password = '{password}' WHERE (email = '{email}');"
	db_RDS.engine.execute(sql)
	return jsonify({"ok":True})

@user_app.route("/reset_password")
def reset():
	token_get = s.loads(request.args.get("token"))
	user = token_get.get("user")
	email = token_get.get("email")
	return render_template("reset.html",user=user,email=email)

@user_app.route("/forget")
def forget_password():
	return render_template("forget_password.html")

@user_app.route("/api/forget",methods=["POST"])
def forget():
	data = request.get_json()
	req_mail = data["mail"]
	msg = Message(subject="This is your Reset Password Mail",sender=mail_username,recipients=[req_mail])
	sql = f"select * from attraction.user where email='{req_mail}'"
	conclusion = db_RDS.engine.execute(sql)
	for i in conclusion:
		token = s.dumps({"user":i[1],"email":req_mail}).decode("utf8")
		msg.html = render_template("mail.html",user = i[1],token=token)
		mail.send(msg)
		return jsonify({"ok":True})
	return jsonify({"error":True})

@user_app.route("/confirm/<token>")
def user_confirm(token):
	if s.loads(token)['user'] and s.loads(token)['email']:
		return redirect(f"/reset_password?token={token}")
	else:
		return "Not Permission"

@user_app.route("/api/user",methods=["GET","POST","PATCH","DELETE"])
def user():
	if request.method=="POST":
		try:
			regex = r".+@.+"
			data = request.get_json()
			name = data.get("name")
			email = data.get("email")
			password = data.get("password")
			if not name or not email or not password:
				return jsonify({"error":True,"message":"註冊失敗，欄位不可以為空"}),400
			# password = jwt.encode({"password":data["password"]},password_key, algorithm="HS256").decode("utf-8")
			password_hash = bcrypt.generate_password_hash(data["password"]).decode('utf8')
			# print(data["password"])
			# print(password_hash)
			# print(type(password_hash))
			# result = bcrypt.check_password_hash(password_hash,data["password"])
			# print(result)
			# return jsonify({"ok":True})
			leader = data.get("leader")
			sql = f"select email from attraction.user where email='{email}'"
			replicate = db_RDS.engine.execute(sql)
			for i in replicate:
				return jsonify({"error":True,"message":"註冊失敗，重複的email"}),400
			if not name or not email or not password:
				return jsonify({"error":True,"message":"註冊失敗，欄位不可以為空"}),400
			if not re.findall(regex,email) or not re.findall(regex,email)[0]==email:
				return jsonify({"error":True,"message":"註冊失敗，email格式錯誤"}),400
			if leader and leader==1:
				sql_check_leader = f"select count(*) from attraction.user where name='{name}'"
				result_fro_leader = db_RDS.engine.execute(sql_check_leader)
				for item in result_fro_leader:
					if item[0]>0:
						return jsonify({"error":True,"message":"導遊名稱重複"}),400
			msg = Message(subject="This is your create Account Mail",sender=mail_username,recipients=[email])
			token = s.dumps({"user":name,"email":email,"leader":leader,"password":password_hash}).decode("utf8")
			msg.html = render_template("create_user_mail.html",user = name,token=token)
			mail.send(msg)
			# sql = f"insert into attraction.user (name,email,password,leader) values ('{name}','{email}','{password}','{leader}')"
			# if not leader:
			# 	sql = f"insert into attraction.user (name,email,password) values ('{name}','{email}','{password}')"
			# db_RDS.engine.execute(sql)
			return jsonify({"ok":True})
		except Exception as e:
			print(e)
			return jsonify({"error":True,"message":"伺服器內部錯誤"}),500
	if request.method=="PATCH":
		try:
			data = request.get_json()
			email = data["email"]
			# password = jwt.encode({"password":data["password"]},password_key, algorithm="HS256").decode("utf-8")
			sql = f"select id,name,email,leader,img_src,password from attraction.user where email='{email}'"
			result = db_RDS.engine.execute(sql)
			for i in result:
				if not bcrypt.check_password_hash(i[5],data["password"]):
					return jsonify({"error":True,"message":"登入失敗，帳號或密碼錯誤"}),400
				session["id"]=i[0]
				session["name"]=i[1]
				session["email"]=i[2]
				session['leader']=i[3]
				session["img_src"]=i[4]
				session.permanent = True
				return jsonify({"ok":True})
			return jsonify({"error":True,"message":"登入失敗，帳號或密碼錯誤"}),400
		except Exception as e:
			print(e)
			return jsonify({"error":True,"message":"伺服器內部錯誤"}),500
	if request.method=="DELETE":
		if "id" in session:
			session.pop("id")
		if "FB" in session:
			session.pop("FB")
			session.pop("FB_ID")
			session.pop("url")
		session.pop("name")
		if "leader" in session:
			session.pop("leader")
		if "email" in session:
			session.pop("email")
		if "google" in session:
			session.pop("google")
		if "img_src" in session:
			session.pop("img_src")
		return jsonify({"ok":True})
	if request.method=="GET":
		if "name" in session:
			return jsonify({"data":{
				"id":session.get("id"),
				"name":session.get("name"),
				"email":session.get("email"),
				"img_src":session.get("img_src"),
				"leader":session.get("leader")
				}
			})
		else:
			return jsonify({"data":None}) 

@user_app.route("/create_user_mail/<token>")
def user_create_mail(token):
	if s.loads(token)['user'] and s.loads(token)['email']:
		name = s.loads(token)['user']
		email = s.loads(token)["email"]
		password = s.loads(token)["password"]
		leader = s.loads(token)["leader"]
		sql = f"select * from attraction.user where email='{email}'"
		data = db_RDS.engine.execute(sql)
		for i in data:
			return render_template("create_success.html",msg="你已驗證成功，請勿重複驗證")
		sql = f"insert into attraction.user (name,email,password,leader) values ('{name}','{email}','{password}','{leader}')"
		if not leader:
			sql = f"insert into attraction.user (name,email,password) values ('{name}','{email}','{password}')"
		db_RDS.engine.execute(sql)
		return render_template("create_success.html",msg="恭喜註冊成功，請待畫面跳轉")
	else:
		return render_template("create_success.html",msg="資料驗證不符")

@user_app.route("/api/google/user",methods=["PATCH"])
def google():
	if request.method == "PATCH":
		# session["google"]="google"
		name = request.get_json()["name"]
		email = request.get_json()["email"]
		session["name"]=request.get_json()["name"]
		session["email"]=request.get_json()["email"]
		session.permanent = True
		sql = f"SELECT * FROM attraction.user where email='{email}'"
		data = db_RDS.engine.execute(sql)
		for i in data:
			session["id"] = i[0]
			return jsonify({"ok":True})
		sql = f"insert into attraction.user (name,email) values ('{name}','{email}')"
		db_RDS.engine.execute(sql)	
		sql = f"SELECT * FROM attraction.user where email='{email}'"
		data2 = db_RDS.engine.execute(sql)
		for i in data2:
			if i[0]:
				session["id"] = i[0]
				return jsonify({"ok":True})
		return jsonify({"error":True})

@user_app.route("/api/FB/user",methods=["PATCH"])
def FB():
	if request.method == "PATCH":
		# session["FB"]="FB"
		session["name"]=request.get_json()["name"]
		# session["FB_ID"]=request.get_json()["FB_ID"]
		session["email"]=request.get_json()["email"]
		session["url"]=request.get_json()["url"]
		session.permanent = True
		name = request.get_json()["name"]
		email = request.get_json()["email"]
		sql = f"SELECT * FROM attraction.user where email='{email}'"
		data = db_RDS.engine.execute(sql)
		for i in data:
			session["id"] = i[0]
			return jsonify({"ok":True})
		sql = f"insert into attraction.user (name,email) values ('{name}','{email}')"
		db_RDS.engine.execute(sql)	
		sql = f"SELECT * FROM attraction.user where email='{email}'"
		data2 = db_RDS.engine.execute(sql)
		for i in data2:
			if i[0]:
				session["id"] = i[0]
				return jsonify({"ok":True})
		return jsonify({"error":True})


@user_app.route("/member_center")
def member_center():
	if "email" not in session:
		return redirect(url_for("index"))
	return render_template("member_center.html")

@user_app.route("/api/user/password",methods=["POST"])
def update_password():
	data = request.get_json()
	old_password = data.get("old_password")
	new_password = data.get("new_password")
	again_password = data.get("again_password")
	email = session.get("email")
	if not old_password or not new_password or not again_password:
		return jsonify({"error":"欄位不可為空"})
	sql = f"select password from attraction.user WHERE email = '{email}'"
	pas = db_RDS.engine.execute(sql)
	for i in pas:
		if not bcrypt.check_password_hash(i[0],old_password):
		# if  jwt.encode({"password":old_password},password_key,algorithm="HS256").decode("utf-8")!=i[0]:
			return jsonify({"error":"舊密碼輸入錯誤"})
		else:
			if new_password!=again_password:
				return jsonify({"error":"新密碼與再次輸入密碼不一樣"})
			if new_password==old_password:
				return jsonify({"error":"新密碼與舊密碼一樣"})
			# new_password = jwt.encode({"password":new_password},password_key,algorithm="HS256").decode("utf-8")
			new_password = bcrypt.generate_password_hash(new_password).decode('utf8')
			sql = f"UPDATE attraction.user SET password = '{new_password}' WHERE email = '{email}'"
			db_RDS.engine.execute(sql)
			return jsonify({"ok":True})
	return jsonify({"error":"您並非使用此系統註冊"})