from flask import Blueprint,request
from flask.json import jsonify
from data import data_handle
import json
from main import db,db_RDS
import requests as req
from config import ytb_key
import math,decimal

attraction_app = Blueprint("attraction_app",__name__)


@attraction_app.route("/api/attractions")
def attr():
	try:
		page = int(request.args.get("page"))+1
		name = request.args.get("keyword")
		mrt = request.args.get("mrt")
		cat = request.args.get("cat")
		if mrt=="all":
			mrt = None
		if cat=="all":
			cat = None
		if name:
			ans = data_handle.filter_by_keyword(db,page,name)
		elif mrt or cat:
			if mrt and cat:
				sql_cmd = f"SELECT count(*) FROM attraction.attractions where mrt='{mrt}' and category='{cat}'"
				sql = f"SELECT * FROM attraction.attractions where mrt='{mrt}' and category='{cat}' limit 12 offset {max(page-1,0)*12}"
			elif mrt:
				sql_cmd = f"SELECT count(*) FROM attraction.attractions where mrt='{mrt}'"
				sql = f"SELECT * FROM attraction.attractions where mrt='{mrt}' limit 12 offset {max(page-1,0)*12}"
			else:
				sql_cmd = f"SELECT count(*) FROM attraction.attractions where category='{cat}'"
				sql = f"SELECT * FROM attraction.attractions where category='{cat}' limit 12 offset {max(page-1,0)*12}"
			data = db.engine.execute(sql_cmd)
			cntt = 0
			for i in data:
				cntt = i[0]
			# sql = f"SELECT * FROM attraction.attractions where mrt='{mrt}' limit 12 offset {max(page-1,0)*12}"
			data = db.engine.execute(sql)
			if page*12>cntt:
				page = None
			ans = []
			res = {}
			for i in data:
				for col,val in i.items():
					if col=="images":
						val = val.split(";")[:-1]
					res[col] = val
					if col=="images":
						ans.append(res.copy())
			return json.dumps({"nextPage":page,"data":ans},ensure_ascii=False)
		else:
			ans = data_handle.filter_by_page(db,page)
		return ans
	except Exception as e:
		print(e)
		return json.dumps({"error":True,"message":"伺服器內部錯誤"},ensure_ascii=False),500

@attraction_app.route("/api/attraction/<id>")
def attr2(id):
	try:
		res = data_handle.filter_by_id(db,id)
		if not res:
			return json.dumps({"error":True,"message":"景點編號錯誤"},ensure_ascii=False),400
		return res
	except:
		return json.dumps({"error":True,"message":"伺服器內部錯誤"},ensure_ascii=False),500

@attraction_app.route("/api/mrt")
def mrt():
	sql = f"SELECT distinct mrt FROM attraction.attractions where mrt!='None'"
	data = db.engine.execute(sql)
	ans = []
	for i in data:
		ans.append(i[0])
	return json.dumps({"data":ans})

@attraction_app.route("/api/cat")
def cat():
	sql = f"SELECT distinct category FROM attraction.attractions"
	data = db.engine.execute(sql)
	ans = []
	for i in data:
		ans.append(i[0])
	return json.dumps({"data":ans})

@attraction_app.route("/api/youtube",methods=["POST"])
def ytb():
	search_word = request.get_json()["search_word"]
	data = req.get(f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={search_word}&type=video&maxResults=1&key={ytb_key}")
	return json.loads(data.text)

@attraction_app.route("/api/score")
def score_app():
	sql = f'''
	SELECT 
    	c.attraction_id,AVG(c.score),count(*)
	FROM
    	(SELECT DISTINCT
        	attraction_id, email, score
    	FROM
        	attraction.message) c group by c.attraction_id
	'''
	data = db_RDS.engine.execute(sql)
	res = {}
	for item in data:
		res[item[0]] = {
			"score":str(item[1]) if item[1] else "0",
			"cnt":item[2]
		}
	return jsonify(res)