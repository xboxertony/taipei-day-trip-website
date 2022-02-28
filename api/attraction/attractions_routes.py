from flask import Blueprint, render_template, session, request, redirect, url_for
from api.models.attractions import Attraction, Image



attractions = Blueprint('attractions',
                   __name__,
                   static_folder='static',
                   template_folder='templates')

#------------------------------------------------------------------------
@attractions.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")


#------------------------------------------------
@attractions.route('api/attractions')
def api_attractions():
  args = request.args
  keyword = args.get('keyword')

  page = args.get('page')
  page_size = 12
  try:
    if page is None:
      page = 0
    page = int(page)
    data = Attraction.query
    if keyword:
      data = data.filter(Attraction.name.like('%' + keyword + '%')).offset(page*page_size).limit(page_size).all()
    else:
      data = data.offset(page*page_size).limit(page_size).all()
      
    
    data_arr = []
    for v in data:
      id = v.id
      images = Image.query.filter_by(attraction_id=id).all() 
      images_arr = []
      for i in images:
        images_arr.append(i.url)
      sub_data = {
        "id":v.id,
        "name": v.name,
        "category": v.category,
        "description": v.description,
        "address": v.address,
        "transport": v.transport,
        "mrt": v.mrt,
        "latitude": v.latitude,
        "longitude": v.longitude,
        "image": images_arr,
      }
      data_arr.append(sub_data)
      if len(data_arr) < 12 :
        next_page = None
      else:
        next_page = page+1

    return {
      "nextPage": next_page,
      "data": data_arr
    }
  except Exception as e:
    return{
      "error": True,
      "message": "錯誤"
    }
    

#------------------------------------------------
@attractions.route('api/attraction/<attractionID>')
def api_attractions_id(attractionID):
  data = Attraction.query.filter_by(id=attractionID).first()
  if not data:
    return{
      "error": True,
      "message": "attractionID錯誤"
    }

  try:
    id = data.id
    images = Image.query.filter_by(attraction_id=id).all() 
    images_arr = []
    for i in images:
      images_arr.append(i.url)
    sub_data = {
      "id":data.id,
      "name": data.name,
      "category": data.category,
      "description": data.description,
      "address": data.address,
      "transport": data.transport,
      "mrt": data.mrt,
      "latitude": data.latitude,
      "longitude": data.latitude,
      "image": images_arr,
    }
    return {
      "data": sub_data
    }

  except:
    return{
      "error": True,
      "message": "錯誤"
  }
    

  
   

    
  