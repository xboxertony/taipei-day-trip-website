from flask import *
from flask_sqlalchemy import SQLAlchemy
import json

from data import data_handle
from config import setapp

import requests as req

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


@app.route("/api/booking",methods=["GET","POST","DELETE"])
def api_book():
	if "name" not in session:
		return jsonify({"error":True,"message":"未登入系統"}),403
	if request.method=="POST":
		try:
			data = request.get_json()
			attractionid = data.get("attractionId")
			date = data.get("date")
			time = data.get("time")
			price = data.get("price")
			if not date or not time or not price:
				return jsonify({"error":True,"message":"有資料未輸入"}),400
			sql = f"insert into booking (attractionId,date,time,price) values ('{attractionid}','{date}','{time}','{price}')"
			db.engine.execute(sql)
			return jsonify({"ok":True})
		except:
			return jsonify({"error":True,"message":"伺服器內部錯誤"}),500
	if request.method=="GET":
		sql = "SELECT attractionId,name,address,images,date,time,price FROM attraction.booking inner join attraction.attractions on attractionId=attractions.id"
		sql_exe = db.engine.execute(sql)
		res = {"data":None}
		for i in sql_exe:
			res = {
				"data":{
					"attraction":{
						"id":i[0],
						"name":i[1],
						"address":i[2],
						"image":i[3].split(";")[0]
						},
				"date":i[4],
				"time":i[5],
				"price":i[6]
				}
			}
		return jsonify(res)
	if request.method=="DELETE":
		sql = "truncate table booking"
		db.engine.execute(sql)
		return jsonify({"ok":True})


@app.route("/api/orders",methods=["POST"])
def order():
	if "name" not in session:
		return jsonify({"error":True,"message":"未登入系統"}),403
	try:
		url = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"
		payload = {
			"partner_key": "partner_WzjWhTGrD8q1kO71lar9OPR5MpdoKdp67EKkkQxrDcY7KVLyhkCKDVGy",
			"prime": request.get_json()["prime"],
			"amount": "1",
			"merchant_id": "tonyny58_CTBC",
			"details": "Some item",
			"cardholder": {
				"phone_number": "+886923456789",
				"name": "不一樣",
				"email": "LittleMing@Wang.com",
				"zip_code": "100",
				"address": "台北市天龍區芝麻街1號1樓",
				"national_id": "A123456789"
				}
		}
		headers = {
			'content-type': 'application/json',
			'x-api-key': 'partner_WzjWhTGrD8q1kO71lar9OPR5MpdoKdp67EKkkQxrDcY7KVLyhkCKDVGy'
		}
		r = req.post(url,data=json.dumps(payload),headers=headers)
		return jsonify(r.text)
	except:
		return jsonify({"error":True,"message":"伺服器內部錯誤"}),500


@app.route("/pay_load",methods=["GET"])
def pay_search():
    url = "https://sandbox.tappaysdk.com/tpc/transaction/query"
    payload = {
        "partner_key": "partner_WzjWhTGrD8q1kO71lar9OPR5MpdoKdp67EKkkQxrDcY7KVLyhkCKDVGy",
        # "filters":{
        #     "bank_transaction_id":"TP20210507Gnw3qF"
        # }
    }
    headers = {
        'content-type': 'application/json',
        'x-api-key': 'partner_WzjWhTGrD8q1kO71lar9OPR5MpdoKdp67EKkkQxrDcY7KVLyhkCKDVGy'
    }

    r = req.post(url,data=json.dumps(payload),headers=headers)
    return json.loads(r.text)

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