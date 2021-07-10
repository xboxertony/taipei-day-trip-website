from main import db_RDS,mail,app
from flask_mail import Message
from config import mail_username
from flask import render_template


with app.app_context():

    sql = "SELECT * FROM attraction.order where datediff(date,current_date()) < 4 and date>current_date() and refund_time is null"

    data = db_RDS.engine.execute(sql)

    res = {}

    for i in data:
        if res.get(i[5]):
            res[i[5]].append({
                "date":i[3],
                "time":i[4],
                "orderid":i[1]
            })
        else:
            res[i[5]] = [{
                "date":i[3],
                "time":i[4],
                "orderid":i[1]
            }]
            
    for email in [em for em in res.keys()]:
        if email in ["tonyny58@gmail.com","x25836901@gmail.com"]:
            sql2 = f"SELECT name FROM attraction.user where email='{email}'"
            data2 = db_RDS.engine.execute(sql2)
            for i in data2:
                msg = Message(subject=f"行前通知，三天內行程",sender=mail_username,recipients=[email])
                msg.html = render_template("inform_schedule_mail.html",data=res[email],name=i[0])
                mail.send(msg)