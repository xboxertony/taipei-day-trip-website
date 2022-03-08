from api import db

class Order(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  order_number = db.Column(db.String(50), nullable=False)
  price = db.Column(db.Integer, nullable=False)
  name = db.Column(db.String(10), nullable=False)
  email = db.Column(db.String(50), nullable=False)
  phone = db.Column(db.String(50), nullable=False)
  order_by = db.Column(db.String(100), db.ForeignKey('user.email'))


  
