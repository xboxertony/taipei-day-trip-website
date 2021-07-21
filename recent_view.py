from flask import Blueprint,session,jsonify
from main import cache,db_RDS
import json


recent_view = Blueprint("recent_view",__name__)

@recent_view.route("/api/recent_view/<idx>")
def recent_view_attr(idx):
    if 'email' not in session:
        return jsonify({"ok":True})
    sql = f"select name from attraction.attractions where id='{idx}'"
    data_RDS = db_RDS.engine.execute(sql)
    for i in data_RDS:
        name = i[0]
    data = cache.get(session['email'])
    if data:
        res = json.loads(data)
        res[idx] = name
        res = json.dumps(res)
    else:
        res = json.dumps({
            idx:name
        })
    cache.set(session['email'],res)
    return jsonify({"ok":True})


@recent_view.route("/api/get_recent_record")
def record():
    if 'email' not in session:
        return jsonify({"error":True,"msg":"請登入觀看瀏覽紀錄"})
    data = cache.get(session['email'])
    if not data:
        return jsonify({"error":True,"msg":"目前無瀏覽紀錄"})
    data = json.loads(data)
    return jsonify(data)