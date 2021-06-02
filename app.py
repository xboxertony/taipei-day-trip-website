from flask import *
from main import app,db

from attraction import attraction_app
from user import user_app
from booking import booking_app
from order import order_app

app.register_blueprint(attraction_app)
app.register_blueprint(user_app)
app.register_blueprint(booking_app)
app.register_blueprint(order_app)

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
	if "name" not in session:
		return redirect(url_for("index"))
	return render_template("thankyou.html")

app.run(host="0.0.0.0",port=3000,debug=True)
## app.run(host="localhost",port=8000,ssl_context=('adhoc'),debug=True)