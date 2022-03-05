from flask import Blueprint, render_template, session, request, redirect, url_for
from api import db
from api.models.bookings import Booking
from api.models.attractions import Attraction, Image

booking = Blueprint('booking',
                   __name__,
                   static_folder='static',
                   template_folder='templates')

#------------------------------------------------------------------------------------------------
@booking.route("/booking")
def base():
	return render_template("booking.html")

#-------------------book a trip----------------------------
@booking.route('api/booking', methods=['POST'])
def api_booking_post():
  
  try:
    if 'email' in session:
      try:
        data = request.get_json()
        input_id = data['attractionId']
        attraction_info = Attraction.query.filter_by(id=input_id).first()
        image_info = Image.query.filter_by(attraction_id=input_id).first()
        input_name=attraction_info.name
        input_address=attraction_info.address
        input_image=image_info.url
        input_date = data['date']
        input_time = data['time']
        input_price = data['price']
        input_email = session['email']
      
        new_booking = Booking(attraction_id=input_id, name=input_name, address=input_address, image=input_image, date=input_date, time=input_time, price=input_price, user_email=input_email)
        db.session.add(new_booking)
        db.session.commit()
        return {
          "ok": True
        }
      except Exception as e:
        return{
          "error": True,
          "message": "訂單建立錯誤"
        }
    else:
      return{
        "error": True,
        "message": "沒登入"
      }
  except Exception as e:
        return{
          "error": True,
          "message": "伺服器內部錯誤"
        }
#-------------------get my books---------------------------------
@booking.route('api/booking', methods=['GET'])
def api_booking_get():
  if 'email' in session:
    try:
      input_email = session['email']
      orders = Booking.query.filter_by(user_email=input_email).all()
      
      result = {
        'data':[]
      }
      
      i = 0
      for i in orders:
        order = {
          'bookingId':i.id,
          'attraction': {
            'id':i.attraction_id,
            'name':i.name,
            'address':i.address,
            'image':i.image,
          },
          'date':str(i.date),
          'time':i.time,
          'price':i.price
        }
        result['data'].append(order)
          
      return result
    except Exception as e:
      return{
        "error": True,
        "message": "內部錯誤"
      }
  else:
    return{
      "error": True,
      "message": "沒登入，請先登入"
    }
    
#---------------delete booking-----------------------------
@booking.route('api/booking/<deleteID>', methods=['DELETE'])
def api_booking_delete(deleteID):
  try:
    current_user = session['email']
    booking = Booking.query.filter_by(id=deleteID).first()
    
    if booking.user_email != current_user:
      return{
        "error": True,
        "message": "無操作權限"
      }
    else:
      db.session.delete(booking)
      db.session.commit()
      return{
        "ok": True
      }
  except Exception as e:
    return{
      "error": True,
      "message": "內部錯誤"
    }
