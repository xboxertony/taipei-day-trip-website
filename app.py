from flask import *
from mysql.connector import pooling

app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config["JSON_SORT_KEYS"] = False
app.config.from_object("config.Config")


connection_pool = pooling.MySQLConnectionPool(
    pool_name=app.config.get("DATABASE_POOL_NAME"),
    pool_size=int(app.config.get("DATABASE_POOL_SIZE")),
    user=app.config.get("DATABASE_USER"),
    password=app.config.get("DATABASE_PASSWORD"),
    host=app.config.get("DATABASE_HOST"),
    database=app.config.get("DATABASE_DATABASE"),
)

db = connection_pool.get_connection()
cursor = db.cursor()


# functions
def try_parse_int(text):
    try:
        return int(text)
    except:
        return None


def get_attraction_by_id(id_num):
    get_data_by_id = "select * from attractions where id = %s"
    db = connection_pool.get_connection()
    cursor = db.cursor()
    cursor.execute(get_data_by_id, (id_num,))
    info = cursor.fetchall()
    cursor.close()
    db.close()
    return info


def get_attractions(datas_per_page, offset):
    get_datas = "with counter as (select count(*) as total_count from attractions) select * from attractions, counter order by id ASC limit %s offset %s"
    db = connection_pool.get_connection()
    cursor = db.cursor()
    cursor.execute(get_datas, (datas_per_page, offset))
    infos = cursor.fetchall()
    cursor.close()
    db.close()
    return infos


def get_attractions_by_keyword(key_word, datas_per_page, offset):
    get_datas_by_keyword = "with counter as (select count(*) as total_count from attractions where name like %s) select * from attractions, counter WHERE name like %s order by id ASC limit %s offset %s"
    db = connection_pool.get_connection()
    cursor = db.cursor()
    cursor.execute(get_datas_by_keyword, (key_word, key_word, datas_per_page, offset))
    infos = cursor.fetchall()
    cursor.close()
    db.close()
    return infos


def parse_datas(infos):
    data_list = []
    total_count = 0
    if infos:
        for num in range(len(infos)):
            id = infos[num][0]
            name = infos[num][1]
            category = infos[num][2]
            description = infos[num][3]
            address = infos[num][4]
            transport = infos[num][5]
            mrt = infos[num][6]
            latitude = float(infos[num][7])
            longitude = float(infos[num][8])
            images = infos[num][9].split(" | ")
            data = {
                "id": id,
                "name": name,
                "category": category,
                "description": description,
                "address": address,
                "transport": transport,
                "mrt": mrt,
                "latitude": latitude,
                "longitude": longitude,
                "images": images,
            }
            if len(infos) > 1:
                data_list.append(data)
        if len(infos) > 10:
            total_count = infos[0][10]
    if len(infos) == 1:
        return (data, total_count)
    else:
        return (data_list, total_count)


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


# Apis
@app.route("/api/attractions")
def attractions():
    try:
        page_num = try_parse_int(request.args.get("page"))
        key_word = request.args.get("keyword")
        datas_per_page = 12
        nextPage = None
        if page_num is None or 0:
            page_num = 0
        offset = (page_num) * datas_per_page
        if key_word is None:
            infos = get_attractions(datas_per_page, offset)
            data = parse_datas(infos)[0]
            total_count = parse_datas(infos)[1]
            if total_count > offset + datas_per_page:
                nextPage = page_num + 1
        if key_word:
            keyword_for_serch = "%" + key_word + "%"
            infos = get_attractions_by_keyword(keyword_for_serch, datas_per_page, offset)
            data = parse_datas(infos)[0]
            total_count = parse_datas(infos)[1]
            if total_count > offset + datas_per_page:
                nextPage = page_num + 1
        return jsonify({"nextPage": nextPage, "data": data})

    except:
        error = {"error": True, "message": "伺服器錯誤"}
        return jsonify(error), 500


@app.route("/api/attractions/<attractionId>")
def attractions_id(attractionId):
    try:
        if try_parse_int(attractionId) is None:
            err = {"error": True, "message": "景點編號不正確"}
            return jsonify(err), 400
        else:
            id_num = try_parse_int(attractionId)
            info = get_attraction_by_id(id_num)
            data = parse_datas(info)[0]
            return jsonify({"data": data})

    except:
        error = {"error": True, "message": "伺服器錯誤"}
        return jsonify(error), 500


app.run(port=3000)
