from flask import Blueprint,request
from flask.json import jsonify
from data import data_handle
import json
from main import db_RDS
import requests as req
from config import ytb_key

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
			ans = data_handle.filter_by_keyword(db_RDS,page,name)
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
			data = db_RDS.engine.execute(sql_cmd)
			cntt = 0
			for i in data:
				cntt = i[0]
			# sql = f"SELECT * FROM attraction.attractions where mrt='{mrt}' limit 12 offset {max(page-1,0)*12}"
			data = db_RDS.engine.execute(sql)
			if page*12>cntt:
				page = None
			ans = []
			res = {}
			for i in data:
				for col,val in i.items():
					if col=="images" or col=="images2":
						val = val.split(";")[:-1]
					res[col] = val
					if col=="images2":
						ans.append(res.copy())
			return json.dumps({"nextPage":page,"data":ans},ensure_ascii=False)
		else:
			ans = data_handle.filter_by_page(db_RDS,page)
		return ans
	except Exception as e:
		print(e)
		return json.dumps({"error":True,"message":"伺服器內部錯誤"},ensure_ascii=False),500

@attraction_app.route("/api/attraction/<id>")
def attr2(id):
	try:
		res = data_handle.filter_by_id(db_RDS,id)
		if not res:
			return json.dumps({"error":True,"message":"景點編號錯誤"},ensure_ascii=False),400
		return res
	except:
		return json.dumps({"error":True,"message":"伺服器內部錯誤"},ensure_ascii=False),500

@attraction_app.route("/api/mrt")
def mrt():
	sql = f"SELECT distinct mrt FROM attraction.attractions where mrt!='None'"
	data = db_RDS.engine.execute(sql)
	ans = []
	for i in data:
		ans.append(i[0])
	return json.dumps({"data":ans})

@attraction_app.route("/api/cat")
def cat():
	sql = f"SELECT distinct category FROM attraction.attractions"
	data = db_RDS.engine.execute(sql)
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
			d.attraction_id, avg(d.score),count(*)
		FROM
			(SELECT 
				attraction_id, email, MAX(time) max_time
			FROM
				attraction.message
			GROUP BY attraction_id , email) c,
			attraction.message d
		WHERE
			d.attraction_id = c.attraction_id
				AND d.email = c.email
				AND d.time = c.max_time
		group by d.attraction_id
	'''
	data = db_RDS.engine.execute(sql)
	res = {}
	for item in data:
		res[item[0]] = {
			"score":str(item[1]) if item[1] else "0",
			"cnt":item[2]
		}
	return jsonify(res)


@attraction_app.route("/api/mrt_color")
def color_for_mrt():
	get_mrt = req.get("https://gist.githubusercontent.com/lackneets/f41836e7e4e938a89f73/raw/e427e8c7b58fcce1338c96bc38b890ae2db6a98a/mrt-taipei.json")
	data = json.loads(get_mrt.text)
	res = {}
	color = {
		"文山內湖線":"#c48c31",
		"淡水、信義線":"#e3002c",
		"小南門、新店線":"#008659",
		"中和、蘆洲、新莊線":"#f8b61c",
		"南港、板橋、土城線":"#0070bd"
	}
	for i in data:
		res[i['name']] = {
			"line":i['line'],
			"color":color.get(i['line'])

		}
	return jsonify(res)