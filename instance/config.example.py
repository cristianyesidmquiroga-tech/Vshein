import os


SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
SQLALCHEMY_DATABASE_URI = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:@127.0.0.1:3306/vshein",
)
SQLALCHEMY_TRACK_MODIFICATIONS = False
CREATE_ALL_ON_STARTUP = True

