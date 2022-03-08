from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

from flask_bcrypt import Bcrypt


import os
from dotenv import load_dotenv


config = load_dotenv("./api/.env")

db = SQLAlchemy()
bcrypt = Bcrypt()


def create_app(): 
  app = Flask(__name__)

  db.init_app(app)
  bcrypt.init_app(app)    
  CORS(app)



  with app.app_context():

    from api.auth.auth_routes import auth
    from api.attraction.attractions_routes import attractions
    from api.booking.booking_routes import booking
    from api.main.main_routes import main
    from api.thankyou.thankyou_routes import thankyou
    from api.order.order_routes import order
    app.register_blueprint(auth, url_prefix='')
    app.register_blueprint(attractions, url_prefix='')
    app.register_blueprint(booking, url_prefix='')
    app.register_blueprint(main, url_prefix='')
    app.register_blueprint(thankyou, url_prefix='')
    app.register_blueprint(order, url_prefix='')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    
    app.config["JSON_AS_ASCII"]=False
    app.config["TEMPLATES_AUTO_RELOAD"]=True


  return app
