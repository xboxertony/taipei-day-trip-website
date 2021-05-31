from flask import Blueprint,session,request,jsonify
from datetime import datetime
from main import db

booking_app = Blueprint("booking_app",__name__)

@booking_app.route("/api/booking",methods=["GET","POST","DELETE"])
def api_book():
	if "name" not in session:
		return jsonify({"error":True,"message":"未登入系統"}),403
	if request.method=="POST":
		try:
			import time
			data = request.get_json()
			time = data.get("time")
			price = data.get("price")
			date = data.get("date")
			attractionid = data.get("attractionId")
			if not date or not time or not price:
				return jsonify({"error":True,"message":"有資料未輸入"}),400
			now = time.strftime("%Y-%m-%d",time.localtime())
			gap = datetime.strptime(date,"%Y-%m-%d")-datetime.strptime(now,"%Y-%m-%d")
			if gap.days<=0:
				return jsonify({"error":True,"message":"請勿選擇過去時間"}),400
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