from flask import Blueprint,session,request,jsonify
from datetime import datetime
from main import db,db_RDS

booking_app = Blueprint("booking_app",__name__)

def find_cnt(keyword,value):
	sql = f"select count(*) from attraction.booking where {keyword} = '{value}'"
	answer = db_RDS.engine.execute(sql)
	for i in answer:
		print(i)
		return i[0]

@booking_app.route("/api/booking",methods=["GET","POST","DELETE","PATCH"])
def api_book():
	if "name" not in session:
		return jsonify({"error":True,"message":"未登入系統"}),403
	if request.method=="POST":
		# try:
		import time as tm
		data = request.get_json()
		time = data.get("time")
		price = data.get("price")
		date = data.get("date")
		attractionid = data.get("attractionId")
		if not date or not time or not price:
			return jsonify({"error":True,"message":"有資料未輸入"}),400
		now = tm.strftime("%Y-%m-%d",tm.localtime())
		gap = datetime.strptime(date,"%Y-%m-%d")-datetime.strptime(now,"%Y-%m-%d")
		if gap.days<=0:
			return jsonify({"error":True,"message":"請勿選擇過去時間"}),400
		if not session.get("google") and not session.get("FB"):
			idx = session["id"]
			cnt = int(find_cnt("userid",idx))+1
			sql = f"select * from attraction.booking where attractionId='{attractionid}' and userid='{idx}'"
			data = db_RDS.engine.execute(sql)
			for i in data:
				return jsonify({"error":True,"message":"該景點已選擇過"}),400
			sql = f"insert into attraction.booking (attractionId,date,time,price,userid,bookingorder) values ('{attractionid}','{date}','{time}','{price}','{idx}','{cnt}')"
		if session.get("google"):
			email = session["email"]
			cnt = int(find_cnt("email",email))+1
			sql = f"select * from attraction.booking where attractionId='{attractionid}' and email='{email}'"
			data = db_RDS.engine.execute(sql)
			for i in data:
				return jsonify({"error":True,"message":"該景點已選擇過"}),400
			sql = f"insert into attraction.booking (attractionId,date,time,price,email,bookingorder) values ('{attractionid}','{date}','{time}','{price}','{email}','{cnt}')"
		if session.get("FB"):
			idx = session["FB_ID"]
			cnt = int(find_cnt("FB_ID",idx))+1
			sql = f"select * from attraction.booking where attractionId='{attractionid}' and FB_ID='{idx}'"
			data = db_RDS.engine.execute(sql)
			for i in data:
				return jsonify({"error":True,"message":"該景點已選擇過"}),400
			sql = f"insert into attraction.booking (attractionId,date,time,price,FB_ID,bookingorder) values ('{attractionid}','{date}','{time}','{price}','{idx}','{cnt}')"
		db_RDS.engine.execute(sql)
		return jsonify({"ok":True})
		# except:
		# 	return jsonify({"error":True,"message":"伺服器內部錯誤"}),500
	if request.method=="GET":
		idx = session.get("id")
		email = session.get("email")
		fb_id = session.get("FB_ID")
		sql = f"SELECT attractionId,name,address,images2,date,time,price,bookingorder,booking.id FROM attraction.booking inner join attraction.attractions on attractionId=attractions.id where (userid = '{idx}' or email = '{email}' or FB_ID = '{fb_id}') and booking.date>current_date() order by bookingorder"
		sql_exe = db_RDS.engine.execute(sql)
		res = {"data":[]}
		for i in sql_exe:
			attr = {
					"attraction":{
						"id":i[0],
						"name":i[1],
						"address":i[2],
						"image":i[3].split(";")[0]
						},
				"date":i[4],
				"time":i[5],
				"price":i[6],
				"order":i[7],
				"database_id":i[8]
				}
			res["data"].append(attr)
			# res = {
			# 	"data":{
			# 		"attraction":{
			# 			"id":i[0],
			# 			"name":i[1],
			# 			"address":i[2],
			# 			"image":i[3].split(";")[0]
			# 			},
			# 	"date":i[4],
			# 	"time":i[5],
			# 	"price":i[6]
			# 	}
			# }
		return jsonify(res)
	if request.method=="DELETE":
		idx = session.get("id")
		email = session.get("email")
		fb_id = session.get("FB_ID")
		if session.get("google"):
			sql = f"delete from attraction.booking where email='{email}'"
		elif session.get("FB"):
			sql = f"delete from attraction.booking where FB_ID='{fb_id}'"
		else:
			sql = f"delete from attraction.booking where userid='{idx}'"
		db_RDS.engine.execute(sql)
		return jsonify({"ok":True})
	if request.method=="PATCH":
		data = request.get_json()["data"]
		for i in data:
			source = i["datasetid"]
			target = i["orderid"]
			sql = f"UPDATE attraction.booking SET bookingorder = '{target}' WHERE (id = '{source}');"
			db_RDS.engine.execute(sql)
		return jsonify({"ok":True})


@booking_app.route("/api/booking/<id>",methods=["DELETE"])
def delete_id(id):
	idx = session.get("id")
	email = session.get("email")
	fb_id = session.get("FB_ID")
	if session.get("google"):
		sql = f"delete from attraction.booking where email='{email}' and attractionId='{id}'"
	elif session.get("FB"):
		sql = f"delete from attraction.booking where FB_ID='{fb_id}' and attractionId='{id}'"
	else:
		sql = f"delete from attraction.booking where userid='{idx}' and attractionId='{id}'"
	db_RDS.engine.execute(sql)
	return jsonify({"ok":True})

