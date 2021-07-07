# import jieba
# from main import db_RDS

# sql = 'SELECT name FROM attraction.attractions'
# data = db_RDS.engine.execute(sql)

# for i in data:
#     result = jieba.cut_for_search(i[0])
#     for j in result:
#         sql2 = f"insert into key_word.dictionary (dictionary.key,dictionary.value) values ('{j}','{i[0]}')"
#         db_RDS.engine.execute(sql2)

# result = jieba.cut_for_search(a)

# for i in result:
#     print(i)