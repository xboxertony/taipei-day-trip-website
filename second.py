import json, os , mysql.connector.pooling, traceback,hashlib
from dotenv import load_dotenv
from dotenv import dotenv_values
from datetime import timedelta

from flask import *
from flask_jwt_extended import (create_access_token, get_jwt_identity, jwt_required, JWTManager )


api = Blueprint('api',__name__)

load_dotenv()
dbconfig = {
"host":'localhost',
"port":'3306',
"database":'tpe_trip',
"user": os.getenv('DB_USER'),
"password": os.getenv('DB_PASSWORD')
}
pool = mysql.connector.pooling.MySQLConnectionPool(pool_name = "mypool", pool_size = 3, **dbconfig) #create a pool which connect with DB


    

@api.route('/api/user',methods=["GET"])
@jwt_required(optional=True)
def get():
    try:
        CN1 = pool.get_connection() #get a connection with pool.
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
        print('發生錯誤',traceback.format_exc())
        CN1.rollback()
        data = {"error": True,"message": "伺服器內部錯誤"}
    
    finally:
        print('GET close')
        if CN1.is_connected():
            cursor.close()
            CN1.close()
        return jsonify(data)


@api.route('/api/user',methods=["POST"])
def post():
    try:
        anchor = 'normal' 
        CN1 = pool.get_connection() #get a connection with pool.
        cursor = CN1.cursor()
        if request.method =='POST': #註冊一個新的使用者
            name_f2, email_f2,password_f2 = request.get_json()['name'], request.get_json()['email'], request.get_json()['password']
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
    except:
        anchor = 'serverError'
        print('發生錯誤',traceback.format_exc())
        CN1.rollback()
        data = {"error": True,"message": "伺服器內部錯誤"}
    else:
        if  anchor == 'normal':
            print(f'{email_f2} commit')
            CN1.commit()
            data = {"ok": True}

        elif anchor == 'duplicate':
            print('此Email已註冊過帳戶')
            data = {"error": True,"message":"此Email已註冊過帳戶"}
    finally:
        print('POST close')
        if CN1.is_connected():
            cursor.close()
            CN1.close()

        return jsonify(data)


@api.route('/api/user',methods=["PATCH"])
def patch():
    try:
        anchor = 0
        CN1 = pool.get_connection() #get a connection with pool.
        cursor = CN1.cursor()
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
                access_token = create_access_token(identity = {"email": email_f1},expires_delta = timedelta(seconds = 120))
                print(access_token)
                resp = make_response({"ok":True})
                resp.set_cookie('access_token', access_token)
                return resp

    except:
        print('發生錯誤',traceback.format_exc())
        CN1.rollback()
        data = {"error": True,"message": "伺服器內部錯誤"}
    finally:
        print('PATCH close')
        if CN1.is_connected():
            cursor.close()
            CN1.close()
        if anchor == 0:
            return jsonify(data)
        


@api.route('/api/user',methods=["DELETE"])
def delete():
    resp = make_response({"ok":True})
    resp.delete_cookie('access_token')
    return resp




#///////////////////////////////////////////////
@api.route("/api/attraction/<int:attractionId>")
def get_id(attractionId):
    try:
        CN1 = pool.get_connection() #get a connection with pool.
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
        if CN1.is_connected():
            cursor.close()
            CN1.close()
        return jsonify(data)


@api.route("/api/attractions/")
def page_keyword():
    try:
        CN1 = pool.get_connection() #get a connection with pool.
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
        if CN1.is_connected():
            cursor.close()
            CN1.close()

        return jsonify(final)