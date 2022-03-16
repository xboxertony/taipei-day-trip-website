import json, os , mysql.connector.pooling, traceback
from dotenv import load_dotenv
from flask import *

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


@api.route("/attraction/<int:attractionId>")
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


@api.route("/attractions/")
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
