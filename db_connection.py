from flask import *
from mysql.connector import pooling
from os import environ, path
from dotenv import load_dotenv


basedir = path.abspath(path.dirname(__file__))
load_dotenv(path.join(basedir, ".env"))


connection_pool = pooling.MySQLConnectionPool(
    pool_name=environ.get("DB_POOL_NAME"),
    pool_size=int(environ.get("DB_POOL_SIZE")),
    user=environ.get("DB_USER"),
    password=environ.get("DB_PASSWORD"),
    host=environ.get("DB_HOST"),
    database=environ.get("DB_DATABASE"),
)

db = connection_pool.get_connection()
cursor = db.cursor()
