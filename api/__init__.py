from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv


config = load_dotenv("./api/.env")

db = SQLAlchemy()


def create_app(): 
  app = Flask(__name__)

  db.init_app(app)


  with app.app_context():

    from api.attraction.attractions_routes import attractions
    from api.booking.booking_routes import booking
    from api.main.main_routes import main
    from api.thankyou.thankyou_routes import thankyou
    app.register_blueprint(attractions, url_prefix='')
    app.register_blueprint(booking, url_prefix='')
    app.register_blueprint(main, url_prefix='')
    app.register_blueprint(thankyou, url_prefix='')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    
    app.config["JSON_AS_ASCII"]=False
    app.config["TEMPLATES_AUTO_RELOAD"]=True


  return app
