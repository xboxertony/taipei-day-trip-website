from flask import *
import json

from data import data_handle
from config import setapp,get_key,get_session_key
from flask_sqlalchemy import SQLAlchemy

app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.secret_key=get_session_key()
setapp(app)
db = SQLAlchemy(app)