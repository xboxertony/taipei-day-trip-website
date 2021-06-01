from flask import Blueprint,request
from data import data_handle
import json
from main import db

attraction_app = Blueprint("attraction_app",__name__)


@attraction_app.route("/api/attractions")
def attr():
	try:
		page = int(request.args.get("page"))+1
		name = request.args.get("keyword")
		mrt = request.args.get("mrt")
		if name:
			ans = data_handle.filter_by_keyword(db,page,name)
		elif mrt:
			sql_cmd = f"SELECT count(*) FROM attraction.attractions where mrt='{mrt}'"
			data = db.engine.execute(sql_cmd)
			cntt = 0
			for i in data:
				cntt = i[0]
			sql = f"SELECT * FROM attraction.attractions where mrt='{mrt}' limit 12 offset {max(page-1,0)*12}"
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
	except:
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