from main import db_RDS
from flask import request,Blueprint,jsonify

search_app = Blueprint("search_app",__name__)

@search_app.route("/api/search",methods=["POST","GET"])
def search():
    if request.method=="POST":
        req = request.get_json()
        time = req.get("time")
        attrid = req.get("attrid")
        sql = f"select cnt from attraction.search where time='{time}' and attrid='{attrid}'"
        exe = db_RDS.engine.execute(sql)
        for i in exe:
            sql = f"update attraction.search set cnt='{i[0]+1}' where time='{time}' and attrid='{attrid}'"
            db_RDS.engine.execute(sql)
            return jsonify({"ok":True})
        sql = f"insert into attraction.search (attrid,time,cnt) values ('{attrid}','{time}','{1}')"
        db_RDS.engine.execute(sql)
        return jsonify({"ok":True})
    if request.method=="GET":
        sql = f"SELECT attractions.id,name,category,mrt,images2 FROM attraction.search left join attraction.attractions on search.attrid=attractions.id where time=date(date_add(current_timestamp(),interval 8 hour)) order by cnt desc limit 5"
        data = db_RDS.engine.execute(sql)
        res = []
        for item in data:
            res.append({
                "id":item[0],
                "name":item[1],
                "category":item[2],
                "mrt":item[3],
                "images2":item[4].split(";")
            })
        return jsonify({"data":res})

@search_app.route("/api/all_view")
def view():
    sql = f"SELECT * FROM attraction.search where time=current_date()"
    data = db_RDS.engine.execute(sql)
    res = {}
    for item in data:
        res[item[1]]=item[3]
    return jsonify(res)

@search_app.route("/api/suggestion")
def suggestion():
    search_word = request.args.get("word")
    sql = f'''
        SELECT 
            attractions.id, attractions.name
        FROM
            key_word.dictionary
                LEFT JOIN
            attraction.attractions ON attractions.name COLLATE utf8mb4_general_ci = dictionary.value
				LEFT JOIN
			key_word.dict_cnt on dict_cnt.name COLLATE utf8mb4_general_ci = attractions.name
        WHERE
            dictionary.key = '{search_word}' and dictionary.key!="" order by dict_cnt.cnt desc limit 5
    '''
    data = db_RDS.engine.execute(sql)
    res = []
    for item in data:
        res.append(item[1])
    return jsonify(res)

@search_app.route("/api/full_name/<name>")
def attr_name(name):
    sql = f"SELECT count(*) FROM attraction.attractions where name='{name}'"
    data = db_RDS.engine.execute(sql)
    for i in data:
        if i[0]>0:
            return jsonify({"ok":True})
    return jsonify({"error":True})

@search_app.route("/api/accu_cnt/<name>")
def insert_name_cnt(name):
    sql = f"select * from key_word.dict_cnt where name='{name}'"
    data = db_RDS.engine.execute(sql)
    for i in data:
        sql2 = f"update key_word.dict_cnt set name='{name}',cnt='{i[2]+1}' where name='{name}'"
        data = db_RDS.engine.execute(sql2)
        return jsonify({"ok":True})
    sql2 = f"insert into key_word.dict_cnt (name,cnt) values ('{name}','{1}')"
    data = db_RDS.engine.execute(sql2)
    return jsonify({"ok":True})