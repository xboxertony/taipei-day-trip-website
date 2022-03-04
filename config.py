from os import environ, path
from dotenv import load_dotenv

basedir = path.abspath(path.dirname(__file__))
load_dotenv(path.join(basedir, ".env"))


class Config:

    # SECRET_KEY = environ.get("SECRET_KEY")
    # SESSION_COOKIE_NAME =
    # STATIC_FOLDER = "static"
    TEMPLATES_FOLDER = "templates"
    DATABASE_DATABASE = environ.get("DB_DATABASE")
    DATABASE_HOST = environ.get("DB_HOST")
    DATABASE_PASSWORD = environ.get("DB_PASSWORD")
    DATABASE_USER = environ.get("DB_USER")
    DATABASE_POOL_NAME = environ.get("DB_POOL_NAME")
    DATABASE_POOL_SIZE = environ.get("DB_POOL_SIZE")


class ProdConfig(Config):
    FLASK_ENV = "production"
    DEBUG = False
    TESTING = False


class DevConfig(Config):
    FLASK_ENV = "development"
    DEBUG = True
    TESTING = True
    DATABASE_URI = environ.get("DEV_DATABASE_URI")
