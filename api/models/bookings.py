from api import db


class Booking(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  attraction_id = db.Column(db.Integer, nullable=False)
  name = db.Column(db.String(50), nullable=False)
  address = db.Column(db.String(100), nullable=False)
  image = db.Column(db.String(500), nullable=False)
  date = db.Column(db.Date, nullable=False)
  time = db.Column(db.String(30), nullable=False)
  price = db.Column(db.Integer, nullable=False)
  order_number = db.Column(db.String(50))
  user_email = db.Column(db.String(100), db.ForeignKey('user.email'))
