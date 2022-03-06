import json
import re
import mysql.connector
from os import environ, path
from dotenv import load_dotenv

basedir = path.abspath(path.dirname(__file__))
load_dotenv(path.join(basedir, "../.env"))
# TODO:abspath vs. path.dirname


db = mysql.connector.connect(
    user=environ.get("DB_USER"),
    password=environ.get("DB_PASSWORD"),
    host=environ.get("DB_HOST"),
    database=environ.get("DB_DATABASE"),
)


with open("taipei-attractions.json", "r", encoding="utf-8") as myfile:
    data_json = json.load(myfile)

attractions_data = data_json["result"]["results"]

counter = 0
for attraction in attractions_data:
    try:
        name = attraction["stitle"]
        category = attraction["CAT2"]
        description = attraction["xbody"]
        address = attraction["address"].replace(" ", "")
        transport = attraction["info"]
        mrt = attraction["MRT"]
        latitude = attraction["latitude"]
        longitude = attraction["longitude"]
        file = attraction["file"]
        urls = re.split(r"https", file)
        urls_list = []
        for url in urls:
            if re.search(r"(?i)\.JPG", url):
                img_url = "https" + url
                urls_list.append(img_url)
        img_urls = " | ".join(urls_list)
        insert_data = "INSERT INTO attractions (name, category, description, address, transport, mrt, latitude, longitude, images) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
        cursor = db.cursor()
        cursor.execute(
            insert_data,
            (name, category, description, address, transport, mrt, latitude, longitude, img_urls),
        )
        db.commit()
        counter += 1
        cursor.close()
    except:
        print("error")
print(f"inserted {counter} datas into attractions")


db.close()
