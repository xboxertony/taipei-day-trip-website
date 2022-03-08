from api import db


class User(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.String(50), nullable=False)
  email = db.Column(db.String(100), nullable=False, unique=True)
  password = db.Column(db.String(80), nullable=False)
  bookings = db.relationship('Booking', backref='user')
  orders = db.relationship('Order', backref='user')

