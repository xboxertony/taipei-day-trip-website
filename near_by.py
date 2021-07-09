import math
from flask import Blueprint
from flask.globals import request
from flask.json import jsonify
from main import db_RDS

near_by_app = Blueprint("near_by_app",__name__)

def rad(d):
    return d*math.pi / 180.0


def get_distance(lat1,lng1,lat2,lng2):
    radlat1 = rad(lat1)
    radlat2 = rad(lat2)
    a = radlat1-radlat2
    b = rad(lng1) - rad(lng2)
    s = 2*math.asin(math.sqrt(math.pow(math.sin(a/2),2)+math.cos(radlat1)*math.cos(radlat2)*math.pow(math.sin(b/2),2)))
    s = s*6378.137
    return s 

@near_by_app.route("/api/nearby")
def get_near():
    attrid = request.args.get("attrid")
    km = request.args.get("km")
    sql = f"select id,name,latitude,longitude from attraction.attractions where id={attrid}"
    original = db_RDS.engine.execute(sql)
    for i in original:
        lat = i[2]
        long = i[3]
    arr = []
    sql2 = f"select id,name,latitude,longitude from attraction.attractions where id!={attrid}"
    res = db_RDS.engine.execute(sql2)
    for i in res:
        if abs(get_distance(lat,long,i[2],i[3]))<int(km):
            arr.append({i[0]:i[1]})
    return jsonify(arr)
