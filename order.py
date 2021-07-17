from flask import Blueprint,session,jsonify,request,render_template
import re

from requests.models import requote_uri
from sqlalchemy.sql.expression import true
from config import get_key
import json
import requests as req
from main import db,db_RDS,mail
from datetime import timedelta,datetime
from flask_mail import Message
from config import mail_username

order_app = Blueprint("order_app",__name__)

@order_app.route("/api/orders",methods=["GET","POST"])
def order():
	if request.method=="POST":
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
			"details":"1",
			# "details": f'{request.get_json()["order"]["trip"]["attraction"]["id"]};{request.get_json()["order"]["trip"]["date"]};{request.get_json()["order"]["trip"]["time"]}',
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
		idx = data["bank_transaction_id"]
		trip = request.get_json()["order"]["trip"]
		main_email = session.get("email")
		name = request.get_json()["order"]["contact"]["name"]
		for item in trip:
			attid = item['attraction']
			date = item['date']
			time = item['time']
			# email = session['email']
			price = item['price']
			order_att = item["order"]
			sql = f"insert into attraction.order (orderid,attid,date,time,email,price,attorder,contact_email,contact_name) values ('{idx}','{attid}','{date}','{time}','{main_email}','{price}','{order_att}','{email}','{name}')"
			db_RDS.engine.execute(sql)
		if data["status"]==0:
			# name = session.get('name')
			msg = Message(subject="台北一日遊，成功付款通知",sender=mail_username,recipients=[email])
			msg.html = render_template("confirm_order_email.html",user = name,orderid=data["bank_transaction_id"])
			mail.send(msg)
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
	if request.method=="GET":
		email = session.get("email")
		sql = f"select attraction.order.*,attractions.name from attraction.order left join attraction.attractions on attractions.id=attraction.order.attid where email='{email}'"
		data = db_RDS.engine.execute(sql)
		res = {}
		for item in data:
			if not res.get(item[1]):
				res[item[1]]={"contact_name":item[10]}
			if not res[item[1]].get("arr"):
				res[item[1]]["arr"]=[{
					"attid":item[2],
					"attname":item[11],
					"date":item[3],
					"time":item[4],
					"price":item[6]
				}]
				res[item[1]]["refund_time"]=item[8]
				continue
			res[item[1]]["arr"].append({
					"attid":item[2],
					"attname":item[11],
					"date":item[3],
					"time":item[4],
					"price":item[6]
				})
			res[item[1]]["refund_time"]=item[8]
		url = "https://sandbox.tappaysdk.com/tpc/transaction/query"
		for order_num in res.keys():
			payload = {
				"partner_key": get_key(),
				"filters":{
					"bank_transaction_id":order_num
				}
			}
			headers = {
				'content-type': 'application/json',
				'x-api-key': get_key()
			}
			r = req.post(url,data=json.dumps(payload),headers=headers)
			data = json.loads(r.text)
			## res[order_num]["time"] = tm.strftime('%Y-%m-%d %H:%M:%S', tm.gmtime(data["trade_records"][0]["time"]))
			res[order_num]["time"] = datetime(1970,1,1)+ timedelta(milliseconds=data["trade_records"][0]["time"])+timedelta(hours=8)
		return jsonify({"data":res})

	# except:
	# 	return jsonify({"error":True,"message":"伺服器內部錯誤"}),500


@order_app.route("/api/order/<orderNumber>")
def pay_search(orderNumber):
	# if "name" not in session:
	# 	return jsonify({"error":True,"message":"未登入系統"}),403
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
	# trip = data["trade_records"][0]["details"].split(";")
	# if data["trade_records"][0]["record_status"] in [0,1]:
	sql = f"SELECT attid,date,name,images,time,email,price,attorder,refund_time,contact_name FROM attraction.order left join attraction.attractions on order.attid=attractions.id where orderid='{orderNumber}' order by attorder"
	d = db_RDS.engine.execute(sql)
	trip = []
	refund_time = None
	contact_name = None
	for i in d:
		attr = {
			"attraction":{
				"id":i[0],
				"name":i[2],
				"image":"https"+i[3].split(";")[0].split("http")[1]
			},
			"date":i[1],
			"time":i[4],
			"price":i[6]
		}
		trip.append(attr)
		refund_time = i[8]
		contact_name = i[9]
	return jsonify({"data":{
		"order_id":orderNumber,
		"summary":data["trade_records"][0]["amount"],
		"contact":{
			"name":data["trade_records"][0]["cardholder"]["name"],
			"email":data["trade_records"][0]["cardholder"]["email"],
			"phone":data["trade_records"][0]["cardholder"]["phone_number"],
		},
		"trip":trip,
		"refund_time":refund_time,
		"contact_name":contact_name
	}})
	# else:
	# 	return jsonify({"data":None})
	# for i in d:
	# 	attr = {
	# 		"id":i[0],
	# 		"name":i[1],
	# 		"address":i[2],
	# 		"image":i[3].split(";")[0]
	# 	}
	# print(data)
	# if data["trade_records"][0]["record_status"] in [0,1]:
	# 	status = 0
	# else:
	# 	status = 1
	# return jsonify({
	# 	"data":{
	# 		"number":data["trade_records"][0]["bank_transaction_id"],
	# 		"trip":{
	# 			"attraction":attr,
	# 			"date":trip[1],
	# 			"time":trip[2]
	# 		},
	# 		"price":data["trade_records"][0]["amount"],
	# 		"contact":{
	# 			"name":data["trade_records"][0]["cardholder"]["name"],
	# 			"email":data["trade_records"][0]["cardholder"]["email"],
	# 			"phone":data["trade_records"][0]["cardholder"]["phone_number"],
	# 		},
	# 		"status":status
	# 	}
	# })

@order_app.route("/api/refund/<order_num>")
def refund(order_num):
	# if "email" not in session:
	# 	return jsonify({"error":True,"msg":"你尚未登入，無法退款"}),400
	sql3 = f"select refund_time from attraction.order where orderid='{order_num}'"
	data_Sql3 = db_RDS.engine.execute(sql3)
	for i in data_Sql3:
		if i[0]:
			return jsonify({"error":True,"msg":"請勿重複退款"})
	sql_check_time = f"select count(*) from attraction.order where orderid='{order_num}' and (date<current_date() or (datediff(date,current_date()) < 3 and date>=current_date()))"
	data_check_cnt = db_RDS.engine.execute(sql_check_time)
	for i in data_check_cnt:
		if i[0]>0:
			return jsonify({"error":True,"msg":"時間已過或是行程三天內不得退款"})
	query_url = "https://sandbox.tappaysdk.com/tpc/transaction/query"
	payload = {
		"partner_key": get_key(),
		"filters":{
			"bank_transaction_id":order_num
		}
	}
	headers = {
		'content-type': 'application/json',
		'x-api-key': get_key()
	}
	r = req.post(query_url,data=json.dumps(payload),headers=headers)
	query_data = json.loads(r.text)
	rec_trade_id = query_data['trade_records'][0]['rec_trade_id']

	refund_url = "https://sandbox.tappaysdk.com/tpc/transaction/refund"
	body = {
		"partner_key": get_key(),
		"rec_trade_id": rec_trade_id
	}

	refund_input = req.post(refund_url,data=json.dumps(body),headers=headers)
	refund_outcome = json.loads(refund_input.text)
	if refund_outcome["msg"]=='Success':
		try:
			sql = f"update leader_info.schedule set booking_user = null where booking_user='{order_num}'"
			db_RDS.engine.execute(sql)
			sql2 = f"update attraction.order set refund_time=TIMESTAMPADD(HOUR, 8, CURRENT_TIMESTAMP) where orderid='{order_num}'"
			db_RDS.engine.execute(sql2)
			email = session['email']
			name = session['name']
			msg = Message(subject="台北一日遊，成功退款通知",sender=mail_username,recipients=[email])
			msg.html = render_template("confirm_order_refund.html",user = name,orderid=order_num)
			mail.send(msg)
			return jsonify({"ok":True})
		except Exception as e:
			print(e)
			return jsonify({"error":True,"msg":"資料庫處理錯誤"}),400
	return jsonify({"error":True,"msg":"退款失敗"}),400