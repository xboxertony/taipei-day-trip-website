import json, os, mysql.connector

## connect to database
connection = mysql.connector.connect(
    host ='localhost',
    port ='3306',
    user = os.environ.get('DB_USER'),
    password = os.environ.get('DB_PASSWORD'),
    database = 'TPE_trip'
)
cursor = connection.cursor()


# id 經檢查是唯一值卻不整齊
with open("taipei-attractions.json",encoding="utf-8") as f:
    dic = json.loads(f.read()) 
    results_list = dic['result']['results'] #list , 58 elements
    for R,result in enumerate(results_list):

        urls = result['file']
        urls_list = [i for i in urls.split('https:') if i!='']  #['//www.travel.taipei/d_upload_ttn/sceneadmin/image/A0/B0/C0/D0/E197/F323/522aa425-345c-4ac4-96b8-b21a33f165ca.JPG']
        
        imgs_f = []
        for url in urls_list:
            last = url.split('.')[-1].lower()
            if last == 'jpg' or last == 'png':
                url_f = 'https:'+url
                imgs_f.append(url_f)

        result['RowNumber'] = R+1
        result['file']=imgs_f
        result['latitude'] = float(result['latitude'])
        result['longitude'] = float(result['longitude'])


        v1, v2, v3, v4, v5= result['RowNumber'], result['stitle'], result['CAT2'], result['xbody'], result['address']
        v6, v7, v8, v9= result['info'], result['MRT'], result['latitude'], result['longitude']

        try:
            cursor.execute(f'insert into `site` (`id`, `name`, `category`,`description`,`address`,`transport`,`mrt`,`latitude`,`longitude`) values("{v1}","{v2}","{v3}","{v4}","{v5}","{v6}","{v7}","{v8}","{v9}");')
            
            for url in imgs_f:
                cursor.execute(f'insert into `images` (`url`, `img_id`) values("{url}","{v1}");')
            
            connection.commit()
        except Exception as e:
            print('Error',type(e),e)
        else:
            print('成功載入')

cursor.close()
connection.close()