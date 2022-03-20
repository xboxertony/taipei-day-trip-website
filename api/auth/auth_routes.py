from flask import Blueprint, render_template, session, request, redirect, url_for
from api import db, bcrypt

from api.models.users import User

auth = Blueprint('auth',
                   __name__,
                   static_folder='static',
                   template_folder='templates')

#--------------------------------sign up locally---------------------------------
@auth.route('/api/user', methods=['POST'])
def signup():
  data = request.get_json()
  input_name = data['name']
  input_email = data['email']
  input_password = data['password']
  
  user = User.query.filter_by(email=input_email).first()
  if user:
    return{
      "error": True,
      "message": "重複的 Email"
    }
  if not user:
    try:
      hashed_password = bcrypt.generate_password_hash(input_password)
      new_user = User(name=input_name, email=input_email, password=hashed_password)
      db.session.add(new_user)
      db.session.commit()
      return  {
          "ok": True
      }
    except Exception as e:
      return{
        "error": True,
        "message": "錯誤"
      }
    
#-----------------------login user-----------------------------------
@auth.route('/api/user', methods=['PATCH'])
def login():
  data = request.get_json()
  input_email = data['email']
  input_password = data['password']
  
  user = User.query.filter_by(email=input_email).first()
  try:
    if user:
      if bcrypt.check_password_hash(user.password, input_password):
        session['email'] = user.email
        session['user'] = user.name
        return {
          "ok": True
        }
      else:
        return {
          "error": True,
          "message": "帳號或密碼錯誤"
        }
    else:
      return {
        "error": True,
        "message": "帳號或密碼錯誤"
      }  
  except Exception as e:
    return{
      "error": True,
      "message": "錯誤"
    }

#-----------------------logout user-----------------------------------
@auth.route('/api/user', methods=['DELETE'])
def logout():
  session.pop('user', None)
  session.pop('email', None)
  return {
    "ok": True
  }

#----------------------get user info----------------------------
@auth.route('api/user', methods=['GET'])
def get_user():
  if 'email' in session:
    input_email = session['email']
    user = User.query.filter_by(email=input_email).first()
    return {
      "data": {
        "id": user.id,
        "name": user.name,
        "email": user.email
      }
    }
  else:
    return {
      "data": None
    }

  

    