from flask.globals import request, session
from flask.json import jsonify
from sqlalchemy.sql.expression import true
from main import db_RDS,db
from flask import Blueprint

collect_app = Blueprint("collect_app",__name__)

@collect_app.route("/api/collect_user",methods=["GET","POST","DELETE"])
def f():
    email = session.get("email")
    fb_idx=session.get("FB_ID")
    if request.method=="POST":
        idx = request.get_json()["id"]
        sql = f"select count(*) from collect.collect_attr where email='{email}' and collect_attr='{idx}'"
        data = db_RDS.engine.execute(sql)
        for i in data:
            if i[0]>0:
                return jsonify({"error":"該景點已收藏過"})
        sql = f"insert into collect.collect_attr (email,FB_ID,collect_attr) values ('{email}','{fb_idx}','{idx}')"
        db_RDS.engine.execute(sql)
        return jsonify({"ok":True})
    if request.method=="DELETE":
        idx = request.get_json()["id"]
        sql = f"DELETE FROM collect.collect_attr WHERE collect_attr = '{idx}' and email='{email}' and FB_ID='{fb_idx}';"
        if fb_idx:
            sql = f"DELETE FROM collect.collect_attr WHERE collect_attr = '{idx}' and FB_ID='{fb_idx}';"
        db_RDS.engine.execute(sql)
        return jsonify({"ok":True})
    if request.method=="GET":
        arr = []
        if not email:
            return jsonify({"data":arr})
        sql = f"select collect_attr from collect.collect_attr where email = '{email}' and FB_ID = '{fb_idx}'"
        if fb_idx:
            sql = f"select collect_attr from collect.collect_attr where FB_ID = '{fb_idx}' "
        data = db_RDS.engine.execute(sql)
        for i in data:
            sql = f"select name from attraction.attractions where id={i[0]}"
            data_attr = db_RDS.engine.execute(sql)
            for j in data_attr:
                arr.append({"attid":i[0],"attname":j[0]})
        return jsonify({"data":arr})