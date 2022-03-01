import urllib.request
import csv
import json
import re
import mysql.connector

db = mysql.connector.connect(user="root", password="12345678", host="127.0.0.1", database="website")

with open("taipei-attractions.json", "r", encoding="utf-8") as myfile:
    data_json = json.load(myfile)

attractions_data = data_json["result"]["results"]

# data = open("data.csv", "w", newline="", encoding="utf-8")
# csv_writer = csv.writer(data)
counter = 0
for attraction in attractions_data:
    # try:
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
    # except:
    #     print("error")
print(f"inserted {counter} datas into attractions")
#     attractions_info = [address]
#     csv_writer.writerow(attractions_info)


# data.close()
db.close()
