from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv
from api.models.attractions import Attraction, Image
import json

config = load_dotenv("./api/.env")
db = SQLAlchemy()

app = Flask(__name__)

db.init_app(app)


with app.app_context():


  app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
  app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
  
  app.config["JSON_AS_ASCII"]=False
  app.config["TEMPLATES_AUTO_RELOAD"]=True

# Opening JSON file 
  with open('./data/taipei-attractions.json') as f:
    
    # returns JSON object as
    # a dictionary
    data = json.load(f)

    # Iterating through the json
    # list
    attractions = []
    for v in data['result']['results']:
      name = v['stitle']
      category = v['CAT2']
      description = v['xbody']
      address = v['address']
      transport = v['info']
      mrt = v['MRT']
      latitude = v['latitude']
      longitude = v['longitude']
      images = []
      for i in v['file'].split('https://'):
        if i.lower().endswith('jpg') or i.lower().endswith('png'):
          image = Image(url='https://' + i)
          images.append(image)
      newAttraction = Attraction(
        name=name,
        category=category,
        description=description,
        address=address,
        transport=transport,
        mrt=mrt,
        latitude=latitude,
        longitude=longitude,
        images=images,
      )
      attractions.append(newAttraction)
    
    print(attractions)

    db.session.add_all(attractions)
    db.session.commit()


