from flask import Blueprint
from main import db_RDS

import requests as req
import bs4
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta,date

news_app = Blueprint("news_app",__name__)

now = date.today()
delta = timedelta(days=1)

urls_list = []
for i in range(1):
    urls_list.append(f"https://www.ettoday.net/news/news-list-{now.strftime('%Y-%m-%d')}-0.htm")
    now = now - delta

def print_urls(url):
    hr = []
    title = []
    cnt = 0
    response = req.get(url)

    root = bs4.BeautifulSoup(response.text,"html.parser")
    data = root.select(".part_list_2")
    
    for i in data:
        for e in i.select("a"):
            ss = "https://www.ettoday.net"+e.get("href")
            hr.append(ss)
        for e in i.select("a"):
            ss = e.text
            ss = ss.replace("\u3000"," ")
            title.append(ss)
        cnt+=1
    return list(zip(hr,title))

def run(f,urls):
    s = 0

    with ThreadPoolExecutor(max_workers=8) as executor:
        res = executor.map(f,urls)
    
    return res


@news_app.route("/api/news")
def news():
    res = run(print_urls,urls_list)
    sql = "truncate table news.news_source"
    db_RDS.execute(sql)
    for i in res:
        for link,title in i:
            title = title.replace("%","%%")
            sql_news = f"insert into news.news_source (news_title,link) values ('{title}','{link}')"
            db_RDS.execute(sql_news)
    return "ok"