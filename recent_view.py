from flask import Blueprint,session,jsonify
from main import cache
import json


recent_view = Blueprint("recent_view",__name__)

@recent_view.route("/api/recent_view/<idx>")
def recent_view_attr(idx):
    if 'email' not in session:
        return jsonify({"ok":True})
    data = cache.get(session['email'])
    if data:
        res = json.loads(data)
        if idx not in res:
            res.append(idx)
        res = json.dumps(res)
    else:
        res = json.dumps([idx])
    cache.set(session['email'],res)
    return jsonify({"ok":True})


@recent_view.route("/api/get_recent_record")
def record():
    if 'email' not in session:
        return jsonify({"ok":True})
    data = cache.get(session['email'])
    data = json.loads(data)
    return jsonify(data)