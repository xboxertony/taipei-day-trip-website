import os
from flask import *
from second import api, pool


app = Flask (__name__) 
app.register_blueprint(api, url_prefix='')

app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.config['JSON_SORT_KEYS'] = False
app.secret_key = os.urandom(24)




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


app.run(host='0.0.0.0',port=3000)
pool._remove_connections()