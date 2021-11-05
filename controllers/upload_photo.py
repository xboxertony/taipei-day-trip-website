from flask.globals import request, session
from main import db_RDS
import boto3
from flask import Blueprint,request,jsonify,session
from config import aws_access_key_id,aws_secret_access_key

s3 = boto3.client(
    "s3",
    aws_access_key_id = aws_access_key_id,
    aws_secret_access_key = aws_secret_access_key
)

upload_photo_app = Blueprint("upload_photo_app",__name__)

allow_path = set(["jpg","png","JPG","PNG"])

@upload_photo_app.route("/api/user_photo",methods=["POST"])
def upload():
    if request.method=="POST":
        try:
            photo = request.files.get("files")
            if not photo:
                return jsonify({"error":True,"message":"請選擇圖片"})
            if photo.filename.split(".")[-1] not in allow_path:
                return jsonify({"error":True,"message":"圖片副檔名不對"})
            if session.get("google") or session.get("FB"):
                return jsonify({"error":True,"message":"您並非以本系統註冊，無法上傳圖片"})
            email = session.get("email")
            real_path = "http://d3nczlg85bnjib.cloudfront.net/"+photo.filename
            sql = f"UPDATE attraction.user SET img_src = '{real_path}' WHERE email = '{email}'"
            db_RDS.engine.execute(sql)
            ##photo.save(file_path)
            s3.upload_fileobj(photo,"tonytony58",photo.filename,ExtraArgs={'ACL': 'public-read'})
            session["img_src"] = real_path
            return jsonify({"ok":True})
        except Exception as e:
            print(e)
            return jsonify({"error":True,"message":"上傳失敗"})