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

@app.route("/test")
def test():
	data_handle.handle(db,"data/taipei-attractions.json")
	return "True"

@app.errorhandler(500)
def resource_not_found(e):
    return json.dumps({"error":True,"message":"伺服器內部錯誤"},ensure_ascii=False),500

@app.route("/api/attractions")
def attr():
	page = int(request.args.get("page"))+1
	name = request.args.get("keyword")
	if name:
		sql_cmd = f"select * from attraction.attractions where name like '%%"+str(name)+f"%%'"
		data = db.engine.execute(sql_cmd)
		cnt = 0
		for i in data:
			cnt+=1
		sql_cmd = f"select * from attraction.attractions where name like '%%"+str(name)+f"%%' limit 12 offset {12*(max(page-1,0))}"
		if page*12>cnt:
			page=None
	else:
		sql_cmd = f"""
			select * from attraction.attractions limit 12 offset {12*(max(page-1,0))}
		"""
		if page>=27:
			page=None
	data = db.engine.execute(sql_cmd)
	ans = []
	res = {}
	for i in data:
		for column,value in i.items():
			if column=="images":
				value = value.split(";")[:-1]
			res[column]=value
			if column=="images":
				ans.append(res.copy())
	return json.dumps({"nextPage":page,"data":ans})

@app.route("/api/attraction/<id>")
def attr2(id):
	sql_cmd = f"""
		select * from attraction.attractions where id={id}
	"""
	data = db.engine.execute(sql_cmd)
	res = dict()
	for i in data:
		for column,value in i.items():
			if column=="images":
				value = value.split(";")[:-1]
			res[column]=value
			print(value)
	if not res:
		abort(400,json.dumps({"error":True,"message":"景點編號錯誤"},ensure_ascii=False))
	return json.dumps({"data":res},ensure_ascii=False)

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

app.run(host="0.0.0.0",port=3000)
