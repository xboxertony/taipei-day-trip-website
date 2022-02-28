from api import db

class Image(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  url = db.Column(db.String(500))
  attraction_id = db.Column(db.Integer, db.ForeignKey('attraction.id'))

class Attraction(db.Model):
  id = db.Column(db.Integer, primary_key=True, nullable=False)
  name = db.Column(db.String(50))
  category = db.Column(db.String(50))
  description = db.Column(db.String(10000))
  address = db.Column(db.String(1000))
  transport = db.Column(db.String(1000))
  mrt = db.Column(db.String(50))
  latitude = db.Column(db.Float)
  longitude = db.Column(db.Float)
  images = db.relationship('Image', backref='attraction')