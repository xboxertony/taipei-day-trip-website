from main import db_RDS
from flask import request,Blueprint,jsonify

search_app = Blueprint("search_app",__name__)

@search_app.route("/api/search",methods=["POST","GET"])
def search():
    if request.method=="POST":
        req = request.get_json()
        time = req.get("time")
        attrid = req.get("attrid")
        sql = f"select cnt from attraction.search where time='{time}' and attrid='{attrid}'"
        exe = db_RDS.engine.execute(sql)
        for i in exe:
            sql = f"update attraction.search set cnt='{i[0]+1}' where time='{time}' and attrid='{attrid}'"
            db_RDS.engine.execute(sql)
            return jsonify({"ok":True})
        sql = f"insert into attraction.search (attrid,time,cnt) values ('{attrid}','{time}','{1}')"
        db_RDS.engine.execute(sql)
        return jsonify({"ok":True})