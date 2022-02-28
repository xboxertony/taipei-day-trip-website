from flask import Blueprint, render_template, session, request, redirect, url_for

main = Blueprint('main',
                   __name__,
                   static_folder='static',
                   template_folder='templates')

#------------------------------------------------------------------------------------------------
@main.route("/")
def index():
	return render_template("index.html")