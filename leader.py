from flask.blueprints import Blueprint
from flask.helpers import url_for
from werkzeug.utils import redirect
from main import db_RDS,db
from flask import session,request,jsonify,render_template,Blueprint
import re
import datetime

leader_app = Blueprint("leader_app",__name__)

@leader_app.route("/api/schedule",methods=["GET","POST","PATCH","DELETE"])
def schedule():
    if request.method=="POST":
        req_data = request.get_json()["data"]
        for data in req_data:
            name = data.get("name")
            Time = data.get("Time").split(" ")
            Time = datetime.datetime.strptime(Time[0]+"-"+Time[1]+"-"+Time[2],"%Y-%m-%d")
            half = data.get("half")
            if data.get("update"):
                sql = f"insert into leader_info.schedule (name,Time,half) values ('{name}','{Time}','{half}') "
            else:
                sql = f"delete from leader_info.schedule where name='{name}' and Time='{Time}' and half='{half}' "
            db_RDS.engine.execute(sql)
        return jsonify({"ok":True})
    if request.method=="GET":
        sql = f"select * from leader_info.schedule"
        data = db_RDS.engine.execute(sql)
        res = {}
        for i in data:
            if not res.get(i[1]):
                res[i[1]] = {}
            if not res[i[1]].get(str(i[2]).split(" ")[0]):
                res[i[1]][str(i[2]).split(" ")[0]]=[i[3]]
                continue
            res[i[1]][str(i[2]).split(" ")[0]].append(i[3])  
        return jsonify(res)

@leader_app.route("/api/leaders")
def leaders():
	sql = "select * from attraction.user where leader=1"
	data = db.engine.execute(sql)
	arr = []
	for i in data:
		arr.append({
			"id":i[0],
			"name":i[1],
			"email":i[2]
		})
	return jsonify({"data":arr})

@leader_app.route("/schedule")
def schedule_index():
	if session.get("leader"):
		print(session.get("leader"))
		return render_template("schedule.html")
	return redirect(url_for("index"))

@leader_app.route("/api/arrange_schedule",methods=["POST"])
def arrange():
    data_all = request.get_json()["arr"]
    order_number = request.get_json()["order_number"]
    for data in data_all:
        sql = f"UPDATE leader_info.schedule SET booking_user = '{order_number}' WHERE id='{data}'"
        db_RDS.engine.execute(sql)
    return jsonify({"ok":True})

@leader_app.route("/api/check_leader",methods=["POST"])
def check():
    data = request.get_json()
    Time = data["date"]
    half = data["time"]
    sql = f"select * from leader_info.schedule where Time='{Time}' and half='{half}' and booking_user is null"
    res = db_RDS.engine.execute(sql)
    for i in res:
        print(i)
        return jsonify({"ok":True,"id":i[0]})
    return jsonify({"error":True,"message":"該時段無導遊排班"})