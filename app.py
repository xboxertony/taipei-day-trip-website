from flask import *
from flask_sqlalchemy import SQLAlchemy
import json

from data import data_handle
from config import setapp

app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
setapp(app)
db = SQLAlchemy(app)

# @app.route("/test")
# def test():
# 	data_handle.handle(db,"data/taipei-attractions.json")
# 	return "True"

@app.route("/api/attractions")
def attr():
	try:
		page = int(request.args.get("page"))+1
		name = request.args.get("keyword")
		if name:
			ans = data_handle.filter_by_keyword(db,page,name)
		else:
			ans = data_handle.filter_by_page(db,page)
		return ans
	except:
		return json.dumps({"error":True,"message":"伺服器內部錯誤"},ensure_ascii=False),500

@app.route("/api/attraction/<id>")
def attr2(id):
	try:
		res = data_handle.filter_by_id(db,id)
		if not res:
			return json.dumps({"error":True,"message":"景點編號錯誤"},ensure_ascii=False),400
		return res
	except:
		return json.dumps({"error":True,"message":"伺服器內部錯誤"},ensure_ascii=False),500

# Pages
@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

app.run(host="0.0.0.0",port=3000,debug=True)