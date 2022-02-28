from flask import Blueprint, render_template, session, request, redirect, url_for

booking = Blueprint('booking',
                   __name__,
                   static_folder='static',
                   template_folder='templates')

#------------------------------------------------------------------------------------------------
@booking.route("/booking")
def base():
	return render_template("booking.html")