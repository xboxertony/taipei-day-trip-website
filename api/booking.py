from flask import *
from api.api import get_attraction_by_id, parse_datas
from db_connection import connection_pool, cursor, db


booking_api = Blueprint("booking", __name__)


@booking_api.route("/api/booking", methods=["GET", "POST", "DELETE"])
def booking_attraction():
    if not request.cookies.get("cookie"):
        error = {"error": True, "message": "未登入系統，拒絕存取"}
        return jsonify(error), 403
    if request.method == "GET":
        if not session:
            return jsonify(None)
        else:
            attraction_id = session["attraction_id"]
            info = get_attraction_by_id(attraction_id)
            data = parse_datas(info)[0]
            response = {
                "data": {
                    "attraction": {
                        "id": data["id"],
                        "name": data["name"],
                        "address": data["address"],
                        "image": data["images"][0],
                    },
                    "date": session["date"],
                    "time": session["time"],
                    "price": session["price"],
                }
            }
            return jsonify(response)
    if request.method == "POST":
        attraction_id = request.get_json()["attractionId"]
        date = request.get_json()["date"]
        time = request.get_json()["time"]
        price = request.get_json()["price"]
        if not attraction_id or not date or not time or not price:
            error = {"error": True, "message": "建立失敗，輸入不正確或其他原因"}
            return jsonify(error), 400
        else:
            session["attraction_id"] = attraction_id
            session["date"] = date
            session["time"] = time
            session["price"] = price
            return jsonify({"ok": True}), 200
    if request.method == "DELETE":
        session.clear()
        return jsonify({"ok": True}), 200
