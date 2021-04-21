import json
def handle(db,path):
    file = path
    # file = "taipei-attractions.json"
    myfile = open(file,'r',encoding="utf-8")
    data = json.load(myfile)
    for data2 in data["result"]["results"]:
    # sql_cmd = f"INSERT INTO attraction.attractions (id,name) values (1,'tony')"
        images = data2["file"].split("http")
        res = ""
        for i in images:
            if i and i[-3:] in ["jpg","JPG","PNG","png"]:
                res+="http"+i+";"
        sql_cmd = f"""
            INSERT INTO attraction.attractions (id,name,category,description,address,transport,mrt,latitude,longitude,images) VALUES ({data2["_id"]},'{data2["stitle"]}', '{data2["CAT2"]}',"{data2['xbody'].replace('"','')}",'{data2["address"]}','{data2["info"]}','{data2["MRT"]}',{float(data2["latitude"])},{float(data2["longitude"])},'{res}');
        """
        try:
            db.engine.execute(sql_cmd)
        except:
            print(sql_cmd)
            pass
    myfile.close()

def filter_by_keyword(db,page,name):
    sql_cmd = f"select count(*) from attraction.attractions where name like '%%"+str(name)+f"%%'"
    data = db.engine.execute(sql_cmd)
    cnt = 0
    for i in data:
        cnt = i[0]
    sql_cmd = f"select * from attraction.attractions where name like '%%"+str(name)+f"%%' limit 12 offset {12*(max(page-1,0))}"
    if page*12>cnt:
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
    return json.dumps({"nextPage":page,"data":ans},ensure_ascii=False)

def filter_by_page(db,page):
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
    return json.dumps({"nextPage":page,"data":ans},ensure_ascii=False)


def filter_by_id(db,id):
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
    return json.dumps({"data":res},ensure_ascii=False)