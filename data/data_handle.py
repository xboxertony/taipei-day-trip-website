def handle(db,path):
    import json
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
