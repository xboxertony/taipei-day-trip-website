from flask import *
from main import app,db

from controllers.attraction import attraction_app
from controllers.user import user_app
from controllers.booking import booking_app
from controllers.order import order_app
from controllers.message import message_app
from controllers.weather import weather_app
from controllers.news import news_app
from controllers.collect import collect_app
from controllers.leader import leader_app
from controllers.upload_photo import upload_photo_app
from controllers.search import search_app
from controllers.recent_view import recent_view
from controllers.near_by import near_by_app

app.register_blueprint(attraction_app)
app.register_blueprint(user_app)
app.register_blueprint(booking_app)
app.register_blueprint(order_app)
app.register_blueprint(message_app)
app.register_blueprint(weather_app)
app.register_blueprint(news_app)
app.register_blueprint(collect_app)
app.register_blueprint(leader_app)
app.register_blueprint(upload_photo_app)
app.register_blueprint(search_app)
app.register_blueprint(recent_view)
app.register_blueprint(near_by_app)

# Pages
@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	if "name" not in session:
		return redirect(url_for("index"))
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	# if "name" not in session:
	# 	return redirect(url_for("index"))
	return render_template("thankyou.html")

if __name__=="__main__":
	app.run(host="0.0.0.0",port=3000,debug=True)
# app.run(host="localhost",port=8000,ssl_context=('adhoc'),debug=True)