from flask import Blueprint, json,request,jsonify
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
        if (page+1)*5<cntt:
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
            if res["FB_ID"] and session.get("FB_ID") and int(res["FB_ID"])==int(session.get("FB_ID")):
                res["delete"]=True
            elif res["email"]==session.get("email") and session.get("email") and not session.get("FB_ID"):
                res["delete"]=True
            else:
                res["delete"]=False
            ans.append(res.copy())
        return jsonify({"nextpage":nextpage,"data":ans})

@message_app.route("/api/message_individual")
def get_msg_by_individual():
    fb_idx = session.get("FB_ID")
    email = session.get("email")
    if email:
        sql = f"select attraction_id,time from attraction.message where email='{email}' order by time desc"
    elif fb_idx:
        sql = f"select attraction_id,time from attraction.message where FB_ID='{fb_idx}' order by time desc"
    data = db.engine.execute(sql)
    arr = []
    for i in data:
        arr.append({
            "time":i[0],
            "attrid":i[1]
        })
    return jsonify({"data":arr})

@message_app.route("/api/message/<id>",methods=["DELETE","PATCH"])
def delete_msg(id):
    if not session.get("email"):
        return jsonify({"error":True}),400
    if request.method=="DELETE":
        if session.get("email") and not session.get("FB_ID"):
            email = session.get("email")
            sql = f"delete from attraction.message where email='{email}' and id='{id}'"
            db.engine.execute(sql)
            return jsonify({"ok":True})
        if session.get("FB_ID"):
            idx = session.get("FB_ID")
            sql = f"delete from attraction.message where FB_ID='{idx}' and id='{id}'"
            db.engine.execute(sql)
            return jsonify({"ok":True})
    if request.method=="PATCH":
        idx = request.get_json()["msg_id"]
        content = request.get_json()["content"]
        sql = f"UPDATE attraction.message set message = '{content}' where id = '{idx}' "
        db.engine.execute(sql)
        return jsonify({"ok":True})
