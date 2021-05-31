from flask import Blueprint,session,jsonify,request
import re
from config import get_key
import json
import requests as req
from main import db

order_app = Blueprint("order_app",__name__)

@order_app.route("/api/orders",methods=["POST"])
def order():
	regex = r".+@.+"
	phone = r'09\d{8}'
	if "name" not in session:
		return jsonify({"error":True,"message":"未登入系統"}),403
	if not request.get_json()["order"]["contact"]["name"] or not request.get_json()["order"]["contact"]["email"] or not request.get_json()["order"]["contact"]["phone"]:
		return jsonify({
			"error":True,
			"message":"輸入不可為空白"
		}),400
	email = request.get_json()["order"]["contact"]["email"]
	phone_order = request.get_json()["order"]["contact"]["phone"]
	if not re.findall(regex,email) or not re.findall(regex,email)[0]==email:
		return jsonify({"error":True,"message":"email輸入格式錯誤"}),400
	if not re.findall(phone,phone_order) or not re.findall(phone,phone_order)[0]==phone_order:
		return jsonify({"error":True,"message":"電話輸入格式錯誤"}),400
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


@order_app.route("/api/order/<orderNumber>")
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