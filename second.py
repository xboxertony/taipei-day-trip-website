import json,os , mysql.connector.pooling, traceback,hashlib,re, requests, sys
from unittest import result
from time import sleep, time
from dotenv import load_dotenv
from dotenv import dotenv_values
from datetime import timedelta
from datetime import datetime


from flask import *
from flask_jwt_extended import (create_access_token, get_jwt_identity, jwt_required, JWTManager )


api = Blueprint('api',__name__)

load_dotenv()
dbconfig = {
"host":os.getenv('DB_HOST'),
"port":'3306',
"database":'tpe_trip',
"user": os.getenv('DB_USERNAME'),
"password": os.getenv('DB_PASSWORD')
}
pool = mysql.connector.pooling.MySQLConnectionPool(pool_name = "mypool", pool_size = 5, **dbconfig) #create a pool which connect with DB



def tapPay(number,prime,attName,attDate, attTime,price,conPhone,userName,attEmail):
    global result, status

    url = 'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime'
    myobj = {"prime": prime,
    "partner_key": os.getenv('partner_key'),
    "merchant_id": "alemapnil_ESUN",
    "details":f'{attName},{attDate},{attTime}',
    "amount": price,
    "cardholder": {
        "phone_number": conPhone,
        "name": userName,
        "email": attEmail},
    }
    data = json.dumps(myobj)  
    resp = requests.post(url, data = data.encode(),  headers = {"Content-Type": "application/json","x-api-key": os.getenv('partner_key')})
    resp2= json.loads(resp.text)
    status = resp2['status']
    if status == 0:
        msg='付款成功'
    else:
        msg='付款失敗'
    
    result = {
        "data": {
            "number": number,
            "payment": {
            "status": status,
            "message": msg
            }
        }}



def orderResponse(cursor,orderNumber,attEmail,attId,attDate,attTime, price,name,phone, status):
    global orderResp
    sqlE = """SELECT * FROM `site`
        WHERE `id` = %s
    """
    cursor.execute(sqlE, (attId,))
    sqlE = cursor.fetchone() #tuple or None

    sqlF = """SELECT * FROM `images`
        WHERE `img_id` = %s limit 1
    """
    cursor.execute(sqlF, (attId,))
    sqlF = cursor.fetchone() #tuple or None

    orderResp ={
        'number':orderNumber,
        'price':price,
        'trip':{
            'attraction':{
            'id':attId,
            'name':sqlE[1],
            'address':sqlE[4],
            'image':sqlF[1]
        },
            'date':attDate.strftime("%Y-%m-%d"),
            'time':attTime
        },
        'contact':{
            'name':name,
            'email':attEmail,
            'phone':phone
        },
        'status':status
    }

#/api/orders
@api.route('/api/orders', methods = ['GET'])
@jwt_required(optional=True)
def order_get():
    try:
        print('get_connection > orders GET')
        CN1 = pool.get_connection() #get a connection with pool.  
        print(CN1.connection_id,'orders GET pool ID create')   
        cursor = CN1.cursor()

        if request.method == 'GET': #取得當前登入的使用者資訊
            decrypt = get_jwt_identity()
            if decrypt is None:
                data = {"error": True,"message": "您尚未登入，無法作業"}
            else:
                orderNumber = request.args.get('number','其他錯誤')
                index = request.url.index('/api')
                main_url = request.url[:index]
                access_token = request.cookies.get('access_token')
                resp = requests.delete(f'{main_url}/api/booking',headers={'Authorization': f'Bearer {access_token}','Content-Type': 'application/json'})
                resp2 = json.loads(resp.text) #dict
                if 'ok' not in resp2:
                    raise BaseException('刪除預定紀錄有誤')

                sqlA = """SELECT * FROM `member_order`
                        WHERE `orderId` = %s
                    """
                cursor.execute(sqlA, (orderNumber,))
                sqlA = cursor.fetchone() #tuple or None

                print('sqlA type is',type(sqlA))

                if sqlA is None:
                    data = {"data": None}
                else:
                    orderResponse(cursor,sqlA[0],sqlA[1],sqlA[2],sqlA[3],sqlA[4],sqlA[5],sqlA[7],sqlA[8],sqlA[9])
                    data = orderResp
    except Exception as e:
        data = {"error": True,"message": "伺服器內部錯誤"}
        print(traceback.format_exc())
        print('GET /api/orders 發生錯誤')
        CN1.rollback()
    finally:
        print(CN1.connection_id,'orders GET close...', CN1.is_connected())
        cursor.close()
        CN1.close()
        return jsonify(data)



@api.route('/api/orders', methods = ['POST'])
@jwt_required(optional=True)
def order_post():
    try:
        print('get_connection > orders POST')
        CN1 = pool.get_connection() #get a connection with pool.  
        print(CN1.connection_id,'orders POST pool ID create')   
        cursor = CN1.cursor()

        prime, price = request.get_json()['prime'], request.get_json()['order']['price']
        attId, attName = request.get_json()['order']['trip']['attraction']['id'], request.get_json()['order']['trip']['attraction']['name']
        attAddress, attImage = request.get_json()['order']['trip']['attraction']['address'], request.get_json()['order']['trip']['attraction']['image']
        attDate, attTime = request.get_json()['order']['trip']['date'], request.get_json()['order']['trip']['time']
        userName, conPhone = request.get_json()['order']['contact']['name'], request.get_json()['order']['contact']['phone']
        pat_phone = re.compile(r"^09\d{8}$")


        if request.method == 'POST': #取得當前登入的使用者資訊
            decrypt = get_jwt_identity()
            if decrypt is None:
                data = {"error": True,"message": "您尚未登入，無法作業"}
            else:
                attEmail = decrypt['email']
                sqlA = """SELECT * FROM `member_bookrecord`
                        WHERE `PersonEmail` = %s
                    """
                cursor.execute(sqlA, (attEmail,))
                sqlA = cursor.fetchone() #tuple or None

                print(sqlA)

                if sqlA is None or sqlA[1] != attId or sqlA[2].strftime("%Y-%m-%d") != attDate or sqlA[3] != attTime or sqlA[4] != price or bool(pat_phone.match(conPhone)) is False:
                    data = {"error": True, "message": "訂單建立失敗，輸入不正確或其他原因"}
                else:
                    #付款並訂單進資料庫
                    print('--------------',prime,'--------------')
                    number = datetime.today().strftime("%Y%m%d%H%M%S")
                    tapPay(number,prime,attName,attDate, attTime,price,conPhone,userName,attEmail)

                    insert = """ insert into `member_order` (`orderId`, `PersonEmail`, `attractionId`,`date`,`time`,
                    `price`,`prime`,`name`,`phone`,`status`) 
                    values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s);"""
                    cursor.execute(insert, (number,attEmail,attId,attDate,attTime,price,prime,userName,conPhone,status))
                    data = result


    except Exception as e:
        print(traceback.format_exc())
        print('POST /api/orders 發生錯誤')
        data = {"error": True,"message": "伺服器內部錯誤"}
        if str(e) == "3819 (HY000): Check constraint 'DNAME' is violated.":
            data = {"error": True,"message": "行程日期已結束，無法訂購，請另選日期"}
        CN1.rollback()
    else:
        print('orders POST commit')
        CN1.commit()
    finally:
        print(CN1.connection_id,'orders POST close...', CN1.is_connected())
        cursor.close()
        CN1.close()
        return jsonify(data)



#// /api/booking'
@api.route('/api/booking', methods = ["GET"])
@jwt_required(optional=True)
def book_get():
    try:
        print('get_connection > book GET')
        CN1 = pool.get_connection() #get a connection with pool.  
        print(CN1.connection_id,'book GET pool ID create')   
        cursor = CN1.cursor()
        if request.method == 'GET': #取得當前登入的使用者資訊
            decrypt = get_jwt_identity()
            if decrypt is None:
                data = {"error": True,"message": "您尚未登入，無法作業"}
            else:
                sql = """SELECT * FROM `member_bookrecord`
                        WHERE `PersonEmail` = %s
                    """
                cursor.execute(sql, (decrypt['email'],))
                bk = cursor.fetchone() #tuple or None
                print('預定資訊',bk)
                if bk is None:
                    data = {"data": None}
                else:
                    ##
                    _2sql = """SELECT * FROM `site`
                            WHERE `id` = %s
                        """
                    cursor.execute(_2sql, (bk[1],))
                    two = cursor.fetchone() #tuple or None
                    print('預定行程:',two[1])

                    ##
                    _3sql = """SELECT * FROM `images`
                            WHERE `img_id` = %s LIMIT 1
                        """
                    cursor.execute(_3sql, (bk[1],))
                    third = cursor.fetchone() #tuple or None
                    print('圖片:',third[1])
                    print('日期',bk[2],type(bk[2]))
                    print('===' * 10)

                    ##
                    data = {"data":{
                        "attraction":{
                            "id":two[0],
                            "name":two[1],
                            "address":two[4],
                            "image":third[1]
                        },
                        "date":bk[2].strftime("%Y-%m-%d"),
                        "time":bk[3],
                        "price":bk[4]
                }}
    except:
        data = {"error": True,"message": "伺服器內部錯誤"}
        print('/api/booking GET 發生錯誤',traceback.format_exc())
        CN1.rollback()
    finally:
        print(CN1.connection_id,'book GET close...', CN1.is_connected())
        cursor.close()
        CN1.close()
        return jsonify(data)



@api.route('/api/booking', methods = ["POST"])
@jwt_required(optional=True)
def book_post():
    try:
        print('get_connection > book POST')
        CN1 = pool.get_connection() #get a connection with pool.
        print(CN1.connection_id,'book POST pool ID create')  
        cursor = CN1.cursor()
        if request.method =='POST': #預定行程
            attractionId, date ,time, price = request.get_json()['attractionId'], request.get_json()['date'], request.get_json()['time'], request.get_json()['price']
            decrypt = get_jwt_identity()
            if decrypt is None:
                data = {"error": True,"message": "您尚未登入，無法作業"}

            else:
                _1sql = """SELECT * FROM `site`
                        WHERE `id` = %s
                    """
                cursor.execute(_1sql, (attractionId,))
                idExist = cursor.fetchone() #tuple or None

                if idExist is None:
                    data = {"error": True,"message": f"輸入錯誤，無此景點 : {attractionId}"}
                elif time != '早上9點到中午12點' and time != '下午2點到6點':
                    data = {"error": True,"message": f"輸入錯誤，無此時段 : {time}"}
                elif price != 2000 and price != 2500:
                    data = {"error": True,"message": f"輸入錯誤，無此價格 : {price}"}  
                else:
                    sql = """SELECT * FROM `member_bookrecord`
                                WHERE `PersonEmail` = %s
                            """
                    cursor.execute(sql, (decrypt['email'],))
                    one = cursor.fetchone() #tuple or None

                    if one is not None: #有預訂過
                        delete = """ delete from `member_bookrecord` where PersonEmail = %s """
                        cursor.execute(delete, (decrypt['email'],))

                    insert = """ insert into `member_bookrecord` (`PersonEmail`, `attractionId`, `date`, `time`,`price`) values(%s,%s,%s,%s,%s);"""
                    cursor.execute(insert, (decrypt['email'], attractionId, date, time, price))

                    data = {"ok": True}

    except Exception as e:
        data = {"error": True,"message": "伺服器內部錯誤"}
        print('/api/booking POST 發生錯誤',type(e),e)
        CN1.rollback()
    else:
        print('book POST commit')
        CN1.commit()

    finally:
        print(CN1.connection_id, 'book POST close...', CN1.is_connected())
        cursor.close()
        CN1.close()
        return jsonify(data)



@api.route('/api/booking', methods = ["DELETE"])
@jwt_required(optional=True)
def book_delete():
    try:
        print('get_connection > book DELETE')
        CN1 = pool.get_connection() #get a connection with pool.
        print(CN1.connection_id,'book DELETE pool ID create')  
        cursor = CN1.cursor()
        if request.method =='DELETE': #刪除預定行程
            decrypt = get_jwt_identity()
            if decrypt is None:
                data = {"error": True,"message": "您尚未登入，無法作業"}

            else:
                sql = """SELECT * FROM `member_bookrecord`
                            WHERE `PersonEmail` = %s
                        """
                cursor.execute(sql, (decrypt['email'],))
                one = cursor.fetchone() #tuple or None

                if one is not None: #有預訂過
                    delete = """ delete from `member_bookrecord` where PersonEmail = %s """
                    cursor.execute(delete, (decrypt['email'],))

                data = {"ok": True}
    except:
        data = {"error": True,"message": "伺服器內部錯誤"}
        print('/api/booking DELETE 發生錯誤',traceback.format_exc())
        CN1.rollback()
    else:
        print('book delete commit')
        CN1.commit()
    finally:
        print(CN1.connection_id, 'book delete close...', CN1.is_connected())
        cursor.close()
        CN1.close()
        return jsonify(data)



#// /api/user'
@api.route('/api/user', methods = ["GET"])
@jwt_required(optional=True)
def get():
    try:
        print('get_connection > user GET')
        CN1 = pool.get_connection() #get a connection with pool.
        print(CN1.connection_id,'user GET pool ID create')  
        cursor = CN1.cursor()
        if request.method =='GET': #取得當前登入的使用者資訊

            decrypt = get_jwt_identity()
            if decrypt is None:
                data = {"data": None}
            else:
                sql = """SELECT * FROM `trip_members`
                        WHERE `email` = %s
                    """
                cursor.execute(sql, (decrypt['email'],))
                one = cursor.fetchone() #tuple or None
                data = {"data":{
                                "id": one[0],
                                "name": one[1],
                                "email": one[2]}}
    except:
        data = {"error": True,"message": "伺服器內部錯誤"}
        print('/api/user GET 發生錯誤',traceback.format_exc())
        CN1.rollback()    
    finally:
        print(CN1.connection_id, 'user GET close...', CN1.is_connected())
        cursor.close()
        CN1.close()
        return jsonify(data)


@api.route('/api/user', methods = ["POST"])
def post():
    try:
        print('get_connection > user POST')
        CN1 = pool.get_connection() #get a connection with pool.
        print(CN1.connection_id,'user POST pool ID create') 
        cursor = CN1.cursor()
        anchor = 'normal' 
        if request.method =='POST': #註冊一個新的使用者
            name_f2, email_f2,password_f2 = request.get_json()['name'], request.get_json()['email'], request.get_json()['password']
            
            pat_name = re.compile(r"^([a-zA-Z0-9_]{3,8}|[\u4e00-\u9fa5]{2,8})$")
            pat_email = re.compile(r"^([\w]+)@([\w]+)\.([a-z]{2,8})(\.[a-z]{2,8})?$")
            pat_password = re.compile(r"^[\w]{4,8}$")

            #審核成功就進資料庫
            if pat_name.match(name_f2) and pat_email.match(email_f2) and pat_password.match(password_f2):
                password_f2 = hashlib.sha256(password_f2.encode("utf-8")).hexdigest()

                sql = """SELECT * FROM `trip_members`
                            WHERE `email` = %s
                        """
                cursor.execute(sql, (email_f2,))
                one = cursor.fetchone() #tuple or None
                if one is None:
                    cursor.execute(f"insert into `trip_members` (`name`, `email`, `password`) values('{name_f2}','{email_f2}','{password_f2}');")
                else:
                    anchor = 'duplicate'
            else:
                anchor = 'notmatch'
    except:
        data = {"error": True,"message": "伺服器內部錯誤"}
        anchor = 'serverError'
        print('/api/user POST 發生錯誤',traceback.format_exc())
        CN1.rollback()
    else:
        if  anchor == 'normal':
            CN1.commit()
            data = {"ok": True}
        elif anchor == 'duplicate':
            data = {"error": True,"message": "此Email已註冊過帳戶"}
        elif anchor =='notmatch':
            data = {"error": True,"message": "輸入的資料不符合格式"}
    finally:
        print(CN1.connection_id, 'user POST close...', CN1.is_connected())
        cursor.close()
        CN1.close()
        return jsonify(data)


@api.route('/api/user', methods = ["PATCH"])
def patch():
    try: 
        print('get_connection > user PATCH')
        CN1 = pool.get_connection() #get a connection with pool.
        print(CN1.connection_id,'user PATCH pool ID create') 
        cursor = CN1.cursor()
        anchor = 0
        if request.method =='PATCH': #登入一個使用者
            email_f1, password_f1 = request.get_json()['email'], request.get_json()['password']
            password_f1 = hashlib.sha256(password_f1.encode("utf-8")).hexdigest()

            sql = """SELECT * FROM `trip_members`
                        WHERE `email` = %s and `password`= %s
                """
            cursor.execute(sql, (email_f1,password_f1))
            one = cursor.fetchone() #tuple or None

            if one is None:
                data = {"error": True,"message": "登入失敗"}
            else:
                anchor += 1
                access_token = create_access_token(identity = {"email": email_f1},expires_delta = timedelta(seconds = 1800))
                print(access_token)
                resp = make_response({"ok":True})
                resp.set_cookie('access_token', access_token)
                return resp

    except:
        data = {"error": True,"message": "伺服器內部錯誤"}
        print('/api/user PATCH 發生錯誤',traceback.format_exc())
        CN1.rollback()
    finally:
        print(CN1.connection_id, 'user PATCH close...', CN1.is_connected())
        cursor.close()
        CN1.close()
        if anchor == 0:
            return jsonify(data)
        

@api.route('/api/user', methods = ["DELETE"])
def delete():
    resp = make_response({"ok":True})
    resp.delete_cookie('access_token')
    return resp


#///////////////////////////////////////////////
@api.route("/api/attraction/<int:attractionId>")
def get_id(attractionId):
    try:
        print('get_connection > INT GET')
        CN1 = pool.get_connection() #get a connection with pool.
        print(CN1.connection_id,'<int> GET pool ID create') 
        cursor = CN1.cursor()
        sql = """SELECT * FROM `site`
                    WHERE `id` = %s
                """
        cursor.execute(sql, (attractionId,))

        one = cursor.fetchone() #tuple or None
        if one is not None:
            sql = """SELECT * FROM `images`
                WHERE `img_id` = %s
            """
            cursor.execute(sql, (one[0],))
            alllist = cursor.fetchall()
            all = [tu[1] for tu in alllist]
            data={
                'data':{
                    'id' : one[0],
                    'name' : one[1],
                    'category' : one[2],
                    'description': one[3],
                    'address' : one[4],
                    'transport' : one[5],
                    'mrt' : one[6],
                    'latitude' : one[7],
                    'longitude' :one[8],
                    'images': all 
                    }
            }
        else:
            data={'error' : True, 'message': "自訂的錯誤訊息"}
    except:
        data={'error' : True, 'message': "自訂的錯誤訊息"}
    finally:
        print(CN1.connection_id, '<int> GET close...', CN1.is_connected())
        cursor.close()
        CN1.close()
        return jsonify(data)


@api.route("/api/attractions/")
def page_keyword():
    try:
        print('get_connection > attractions GET')
        CN1 = pool.get_connection() #get a connection with pool.
        print(CN1.connection_id,'attractions GET pool ID create') 
        cursor = CN1.cursor()
        page = int(request.args.get('page',0))        
        keyword = request.args.get('keyword',None)
        
        print(f'目前頁碼: {page}, 關鍵字: {keyword}')

        if keyword is None:
            if page > 0:
                index = page * 12
            else:
                index = page

            sql = """SELECT * FROM `site`
                        order by `id` limit 12 offset %s
                    """
            cursor.execute(sql, (index,))
            _12site = cursor.fetchall() #site 

            datalist = []
            for one in _12site:
                sql = """SELECT * FROM `images`
                    WHERE `img_id` = %s
                """
                cursor.execute(sql, (one[0],))
                alllist = cursor.fetchall()
                all = [tu[1] for tu in alllist]
                data={
                    'id' : one[0],
                    'name' : one[1],
                    'category' : one[2],
                    'description': one[3],
                    'address' : one[4],
                    'transport' : one[5],
                    'mrt' : one[6],
                    'latitude' : one[7],
                    'longitude' :one[8],
                    'images': all 
                }
                datalist.append(data)

            cursor.execute('select count(*) from `site`;')
            total = cursor.fetchone()[0]

            if _12site == [] or _12site[-1][0] == total: #若12景點為空 或是最後景點的id為total，表示已無下一頁
                nextpage = None
            else:
                nextpage = page + 1

            final={'nextPage' : nextpage,'data' :datalist}
        
        else:
            if '%' in keyword or '_' in keyword:
                s = []
                print(s[0],'關鍵字有特殊符號產生錯誤')


            if page > 0:
                index = page * 12
            else:
                index = page
            
            trans_key = '%' + keyword + '%'
            sql = """SELECT * FROM `site`
                where `name` LIKE %s
                    order by `id` desc limit 1
            """
            
            cursor.execute(sql, (trans_key,))
            lastKey = cursor.fetchone()

            if lastKey is None:
                pass
            else:
                lastKey_i = lastKey[0]

            sql = """SELECT * FROM `site`
                where `name` LIKE %s                     
                order by `id` limit 12 offset %s
            """
            
            cursor.execute(sql, (trans_key,index))
            _12site = cursor.fetchall() #site 

            datalist = []
            for one in _12site:
                sql = """SELECT * FROM `images`
                    WHERE `img_id` = %s
                """
                cursor.execute(sql, (one[0],))
                alllist = cursor.fetchall()
                all = [tu[1] for tu in alllist]
                data={
                    'id' : one[0],
                    'name' : one[1],
                    'category' : one[2],
                    'description': one[3],
                    'address' : one[4],
                    'transport' : one[5],
                    'mrt' : one[6],
                    'latitude' : one[7],
                    'longitude' :one[8],
                    'images': all 
                }
                datalist.append(data)


            if _12site == [] or _12site[-1][0] == lastKey_i: #若12景點為空 或是最後景點的id為lastKey_i，表示已無下一頁
                nextpage = None
            else:
                nextpage = page + 1

            final={'nextPage' : nextpage,'data' :datalist}

    except:
        print(traceback.format_exc())
        final = {'error' : True, 'message': "自訂的錯誤訊息"}
    finally:
        print(CN1.connection_id, 'attractions GET close...', CN1.is_connected())
        cursor.close()
        CN1.close()
        return jsonify(final)
