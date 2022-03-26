import os
from flask import *
from second import api, pool
from flask_jwt_extended import (create_access_token,get_jwt_identity, jwt_required, JWTManager )

app = Flask (__name__) 

app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config['JSON_SORT_KEYS'] = False
app.secret_key = os.urandom(24)

app.register_blueprint(api, url_prefix='')
app.config["JWT_SECRET_KEY"] = os.getenv('tokenKey')
jwt = JWTManager(app)



@jwt.expired_token_loader
def my_expired_token_callback(jwt_header, jwt_payload):
    return jsonify(data = None), 200


@jwt.invalid_token_loader
def my_invalid_token_callback(invalid_token):
	return jsonify(data = None), 200


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



@app.route("/base")
def base():
	return render_template("base.html")


app.run(port=3000)
pool._remove_connections()