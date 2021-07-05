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
    if request.method=="GET":
        sql = f"SELECT attractions.id,name,category,mrt,images FROM attraction.search left join attraction.attractions on search.attrid=attractions.id where time=current_date() order by cnt desc limit 5"
        data = db_RDS.engine.execute(sql)
        res = []
        for item in data:
            res.append({
                "id":item[0],
                "name":item[1],
                "category":item[2],
                "mrt":item[3],
                "images":item[4].split(";")
            })
        return jsonify({"data":res})