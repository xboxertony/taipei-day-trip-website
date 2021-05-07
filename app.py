from flask import *
from flask_sqlalchemy import SQLAlchemy
import json

from data import data_handle
from config import setapp

app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.secret_key="abc"
setapp(app)
db = SQLAlchemy(app)

# @app.route("/test")
# def test():
# 	data_handle.handle(db,"data/taipei-attractions.json")
# 	return "True"

@app.route("/api/attractions")
def attr():
	try:
		page = int(request.args.get("page"))+1
		name = request.args.get("keyword")
		if name:
			ans = data_handle.filter_by_keyword(db,page,name)
		else:
			ans = data_handle.filter_by_page(db,page)
		return ans
	except:
		return json.dumps({"error":True,"message":"伺服器內部錯誤"},ensure_ascii=False),500

@app.route("/api/attraction/<id>")
def attr2(id):
	try:
		res = data_handle.filter_by_id(db,id)
		if not res:
			return json.dumps({"error":True,"message":"景點編號錯誤"},ensure_ascii=False),400
		return res
	except:
		return json.dumps({"error":True,"message":"伺服器內部錯誤"},ensure_ascii=False),500

@app.route("/api/user",methods=["GET","POST","PATCH","DELETE"])
def user():
	if request.method=="POST":
		try:
			data = request.get_json()
			name = data["name"]
			email = data["email"]
			password = data["password"]
			sql = f"select email from user where email='{email}'"
			replicate = db.engine.execute(sql)
			for i in replicate:
				return jsonify({"error":True,"message":"註冊失敗，重複的email"}),400
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
				return jsonify({"ok":True})
			return jsonify({"error":True,"message":"登入失敗，帳號或密碼錯誤"}),400
		except:
			return jsonify({"error":True,"message":"伺服器內部錯誤"}),500
	if request.method=="DELETE":
		print(session)
		session.pop("id")
		session.pop("name")
		session.pop("email")
		return jsonify({"ok":True})
	if request.method=="GET":
		if "name" in session:
			return jsonify({"data":{
				"id":session["id"],
				"name":session["name"],
				"email":session["email"]
				}
			})
		else:
			return jsonify({"data":None}) 

# @app.route("/test/<id>")
# def testtest(id):
# 	return render_template("place_test.html")

@app.route("/test/order")
def test_order():
	return render_template("place_order_test.html")

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

app.run(host="0.0.0.0",port=3000,debug=True)