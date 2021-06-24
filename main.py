from flask import *
import json

from data import data_handle
from config import setapp,get_key,get_session_key,mail_username,mail_password,mail_key
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from itsdangerous import TimedJSONWebSignatureSerializer
from sqlalchemy import create_engine

app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.secret_key=get_session_key()
setapp(app)
db = SQLAlchemy(app)
db_RDS = create_engine(app.config['SQLALCHEMY_BINDS']['db_news'])
app.config.update(
    SSL_DISABLE = False,
    MAIL_SERVER='smtp.gmail.com',
    MAIL_PORT=465,
    MAIL_USE_SSL=True,
    MAIL_USERNAME=mail_username,
    MAIL_PASSWORD=mail_password
)
mail = Mail(app)
s = TimedJSONWebSignatureSerializer(mail_key)