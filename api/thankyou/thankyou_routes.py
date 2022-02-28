from flask import Blueprint, render_template, session, request, redirect, url_for

thankyou = Blueprint('thankyou',
                   __name__,
                   static_folder='static',
                   template_folder='templates')

#------------------------------------------------------------------------------------------------
@thankyou.route("/thankyou")
def base():
	return render_template("thankyou.html")