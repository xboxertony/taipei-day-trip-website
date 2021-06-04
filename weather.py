from flask import Blueprint
from flask import json
from flask.globals import request
from flask.json import jsonify
import requests as req

weather_app = Blueprint("weather_app",__name__)

@weather_app.route("/api/weather")
def weather():
    data = req.get("https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-D0047-091?Authorization=CWB-6DB1B8BA-C3F5-49F7-8443-999865A34532&locationName=%E8%87%BA%E5%8C%97%E5%B8%82")
    return json.loads(data.text)