from flask import Blueprint,request,jsonify
from flask.globals import session
from main import db
from datetime import datetime, timedelta

message_app = Blueprint("message_app",__name__)

@message_app.route("/api/message",methods=["GET","POST"])
def mes():
    if request.method=="POST":
        if "name" not in session:
            return jsonify({"error":True})
        attid = request.get_json()["attid"]
        mes = request.get_json()["message"]
        name = session.get("name")
        if session.get("FB_ID"):
            idx = session.get("FB_ID")
            sql = f"INSERT INTO message (name,attraction_id,message,FB_ID) VALUES ('{name}','{attid}','{mes}', '{idx}');"
            db.engine.execute(sql)
        else:
            email = session.get("email")
            sql = f"INSERT INTO message (name,attraction_id,message,email) VALUES ('{name}','{attid}','{mes}', '{email}');"
            db.engine.execute(sql)
        return jsonify({"ok":True})
    if request.method=="GET":
        attid = request.args.get("attid")
        page = int(request.args.get("page"))
        sql = f"select count(*) from message where attraction_id={attid}"
        data = db.engine.execute(sql)
        cntt = 0
        nextpage = None;
        for i in data:
            cntt = i[0]
        if (page+1)*5<=cntt:
            nextpage = page+1
        sql = f"select * from message where attraction_id={attid} order by time desc limit 5 offset {page*5}"
        data = db.engine.execute(sql)
        ans = []
        res = {}
        for item in data:
            for key,value in item.items():
                if key=="time":
                    value = str(value+timedelta(hours=8))
                    res["time"]=value
                    continue
                res[key]=value
            ans.append(res.copy())
        return jsonify({"nextpage":nextpage,"data":ans})