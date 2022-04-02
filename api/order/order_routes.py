from flask import Blueprint, render_template, session, request, redirect, url_for, jsonify
from api import db
import os
import requests
from datetime import datetime, timezone, timedelta
from api.models.bookings import Booking
from api.models.orders import Order

order = Blueprint('order',
                   __name__,
                   static_folder='static',
                   template_folder='templates')
#------------------------------------------------------------------------------------------------
@order.route("/orders")
def base():
	return render_template("order.html")
#-----------------------------------------------------------
@order.route('/order/<orderNumber>')
def order_page(orderNumber):
  return render_template("old_order.html")

#--------------------------pay-------------------------------
@order.route('/api/orders', methods=['POST'])
def place_order():
  try:
    if 'email' in session:
      current_user = session['email']
      try:
        data = request.get_json()
        if not data['order']['contact']['name'] or not data['order']['contact']['email'] or not data["order"]["contact"]["phone"]:
          return {
          "error": True,
          "message": '請完整資訊'
        }
        total_num = len(data['order']["trip"])
        
        for attraction in data['order']["trip"]:
          ordered_id = attraction["bookingId"]
          ordered = Booking.query.filter_by(id=ordered_id).all()
          for order in ordered:
            if order.order_number:
              return{
                "error": True,
                "message": "請確認是否重複付款"
              }
        order_data = {
          "prime": data["prime"],
          "partner_key":os.getenv('APP_PARTNER_KEY'),
          "merchant_id":os.getenv('APP_MERCHANT_ID'),
          "amount":data["order"]["price"],
          "details":data["order"]["contact"]["name"] + "的訂單",
          "cardholder":{
            "phone_number":data["order"]["contact"]["phone"],
            "name":data["order"]["contact"]["name"],
            "email":data["order"]["contact"]["email"]
          }
        }
        headers = {'content-type': 'application/json', "x-api-key": os.getenv('APP_PARTNER_KEY')}
        res = requests.post('https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime', headers=headers, json=order_data).json()
        status_code = res["status"]
        tz = timezone(timedelta(hours=+8))
        now = datetime.now(tz)
        dt_string = now.strftime("%Y%m%d%H%M%S")
        input_order_number = dt_string

        if status_code == 0:
          for attraction in data['order']["trip"]:
            ordered_id = attraction["bookingId"]
            ordered = Booking.query.filter_by(id=ordered_id).all()
            for order in ordered:
              order.order_number = input_order_number
            db.session.commit()
          new_order = Order(order_number=input_order_number, price=data["order"]["price"], name=data["order"]["contact"]["name"], email=data["order"]["contact"]["email"], phone=data["order"]["contact"]["phone"], order_by=current_user)
          db.session.add(new_order)
          db.session.commit()

          
          return {
            "data": {
              "number":input_order_number,
              "payment": {
                "status":status_code,
                "message":"付款成功，共" + str(total_num) + "筆，訂單編號：" + str(input_order_number)
              }
            }
          }
        else:
          return {
          "error": True,
          "message": res['msg']
        }
      except Exception as e:
        print(e)
        return{
          "error": True,
          "message": "付款錯誤"
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
#-----------------------------------------------------------
@order.route('/api/orders/', methods=['GET'])
def get_all_orders():
  if 'email' in session:
    current_user = session['email']
    order_info = Order.query.filter_by(order_by=current_user).all()
    orders_arr = []
    for i in order_info:
      orders_arr.append(i.order_number)
    return{
      "data":orders_arr
    }
  else:
    return{
      "error":True,
      "message":"未登入"
    }


#-----------------------------------------------------------
@order.route('/api/orders/<orderNumber>', methods=['GET'])
def get_order(orderNumber): 
  if 'email' in session:

    orders = Booking.query.filter_by(order_number=orderNumber).all()
    order_info = Order.query.filter_by(order_number=orderNumber).first()
    trips = []
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
      trips.append(order)
      
    return{
    "data": {
      "number": orderNumber,
      "price": order_info.price,
      "trip": trips,
      "contact": {
        "name": order_info.name,
        "email": order_info.email,
        "phone": order_info.phone
      },
      "status": 1
    }
  }
  else:
    return{
      "error": True,
      "message": "未登入系統，拒絕存取"
    }

      
  