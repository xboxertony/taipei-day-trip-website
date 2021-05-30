from flask import *
from flask_sqlalchemy import SQLAlchemy
import json

from data import data_handle
from config import setapp,get_key,get_session_key

import requests as req

app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.secret_key=get_session_key()
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


@app.route("/api/google/user",methods=["PATCH"])
def google():
	if request.method == "PATCH":
		session["google"]="google"
		session["name"]=request.get_json()["name"]
		session["email"]=request.get_json()["email"]
		session.permanent = True
		return jsonify({"ok":True})

@app.route("/api/FB/user",methods=["PATCH"])
def FB():
	if request.method == "PATCH":
		session["FB"]="FB"
		session["name"]=request.get_json()["name"]
		session["FB_ID"]=request.get_json()["FB_ID"]
		session["email"]=request.get_json()["email"]
		session["url"]=request.get_json()["url"]
		session.permanent = True
		return jsonify({"ok":True})
	# if request.method == "DELETE":
	# 	session.pop("google")
	# 	session.pop("name")
	# 	session.pop("email")
	# 	return jsonify({"ok":True})

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
			if not session.get("google") and not session.get("FB"):
				idx = session["id"]
				sql = f"insert into booking (attractionId,date,time,price,userid) values ('{attractionid}','{date}','{time}','{price}','{idx}')"
			if session.get("google"):
				email = session["email"]
				sql = f"insert into booking (attractionId,date,time,price,email) values ('{attractionid}','{date}','{time}','{price}','{email}')"
			if session.get("FB"):
				idx = session["FB_ID"]
				sql = f"insert into booking (attractionId,date,time,price,FB_ID) values ('{attractionid}','{date}','{time}','{price}','{idx}')"
			db.engine.execute(sql)
			return jsonify({"ok":True})
		except:
			return jsonify({"error":True,"message":"伺服器內部錯誤"}),500
	if request.method=="GET":
		idx = session.get("id")
		email = session.get("email")
		fb_id = session.get("FB_ID")
		sql = f"SELECT attractionId,name,address,images,date,time,price FROM attraction.booking inner join attraction.attractions on attractionId=attractions.id where userid = '{idx}' or email = '{email}' or FB_ID = '{fb_id}'"
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
		idx = session.get("id")
		email = session.get("email")
		fb_id = session.get("FB_ID")
		if session.get("google"):
			sql = f"delete from booking where email='{email}'"
		elif session.get("FB"):
			sql = f"delete from booking where FB_ID='{fb_id}'"
		else:
			sql = f"delete from booking where userid='{idx}'"
		db.engine.execute(sql)
		return jsonify({"ok":True})


@app.route("/api/orders",methods=["POST"])
def order():
	if "name" not in session:
		return jsonify({"error":True,"message":"未登入系統"}),403
	if not request.get_json()["order"]["contact"]["name"] or not request.get_json()["order"]["contact"]["email"] or not request.get_json()["order"]["contact"]["phone"]:
		return jsonify({
			"error":True,
			"message":"輸入不可為空白"
		}),400
	# try:
	url = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"
	payload = {
		"partner_key": get_key(),
		"prime": request.get_json()["prime"],
		"amount": request.get_json()["order"]["price"],
		"merchant_id": "tonyny58_CTBC",
		"details": f'{request.get_json()["order"]["trip"]["attraction"]["id"]};{request.get_json()["order"]["trip"]["date"]};{request.get_json()["order"]["trip"]["time"]}',
		"cardholder": {
			"phone_number": request.get_json()["order"]["contact"]["phone"],
			"name": request.get_json()["order"]["contact"]["name"],
			"email": request.get_json()["order"]["contact"]["email"],
			"zip_code": "100",
			"address": "台北市天龍區芝麻街1號1樓",
			"national_id": "A123456789"
			}
	}
	headers = {
		'content-type': 'application/json',
		'x-api-key': get_key()
	}
	r = req.post(url,data=json.dumps(payload),headers=headers)
	data = json.loads(r.text)
	if data["status"]==0:
		return jsonify({
			"data":{
				"number":data["bank_transaction_id"],
				"payment":{
					"status":"已付款",
					"message":"付款成功",
				}
			}
		})
	else:
		return jsonify({
			"data":{
				"number":data["bank_transaction_id"],
				"payment":{
					"status":"未付款",
					"message":"付款失敗",
				}
			}
		})
	# except:
	# 	return jsonify({"error":True,"message":"伺服器內部錯誤"}),500


@app.route("/api/order/<orderNumber>")
def pay_search(orderNumber):
	if "name" not in session:
		return jsonify({"error":True,"message":"未登入系統"}),403
	url = "https://sandbox.tappaysdk.com/tpc/transaction/query"
	payload = {
        "partner_key": get_key(),
        "filters":{
            "bank_transaction_id":orderNumber
        }
    }
	headers = {
        'content-type': 'application/json',
        'x-api-key': get_key()
    }
	r = req.post(url,data=json.dumps(payload),headers=headers)
	data = json.loads(r.text)
	trip = data["trade_records"][0]["details"].split(";")
	sql = f"select id,name,address,images from attractions where id='{trip[0]}'"
	attr = {}
	d = db.engine.execute(sql)
	for i in d:
		attr = {
			"id":i[0],
			"name":i[1],
			"address":i[2],
			"image":i[3].split(";")[0]
		}
	print(data)
	if data["trade_records"][0]["record_status"] in [0,1]:
		status = 0
	else:
		status = 1
	return jsonify({
		"data":{
			"number":data["trade_records"][0]["bank_transaction_id"],
			"trip":{
				"attraction":attr,
				"date":trip[1],
				"time":trip[2]
			},
			"price":data["trade_records"][0]["amount"],
			"contact":{
				"name":data["trade_records"][0]["cardholder"]["name"],
				"email":data["trade_records"][0]["cardholder"]["email"],
				"phone":data["trade_records"][0]["cardholder"]["phone_number"],
			},
			"status":status
		}
	})


# Pages
@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	if "name" not in session:
		return redirect(url_for("index"))
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

app.run(host="0.0.0.0",port=3000,debug=True)
# app.run(host="localhost",port=8080,ssl_context=('adhoc'),debug=True)