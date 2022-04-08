from flask import *
from db_connection import connection_pool
import datetime
import uuid

init_status = "outstanding"
valid_statuses = ["outstanding", "paid"]

# definition of data model
# data persistence layer


class Order:
    def __init__(
        self,
        member_id,
        attraction_id,
        booking_date,
        booking_time,
        booking_price,
        contact_name,
        contact_email,
        contact_phone,
    ):
        self.order_number = str(uuid.uuid4())
        self.member_id = member_id
        self.attraction_id = attraction_id
        self.booking_date = booking_date
        self.booking_time = booking_time
        self.booking_price = booking_price
        self.contact_name = contact_name
        self.contact_email = contact_email
        self.contact_phone = contact_phone
        self.payment_status = init_status

    def insert(self):
        sql = """insert into orders (order_number, attraction_id, member_id, booking_date, booking_time, booking_price, contact_name,
                                contact_email, contact_phone, payment_status)
            values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
        db = connection_pool.get_connection()
        cursor = db.cursor()
        cursor.execute(
            sql,
            (
                self.order_number,
                self.attraction_id,
                self.member_id,
                self.booking_date,
                self.booking_time,
                self.booking_price,
                self.contact_name,
                self.contact_email,
                self.contact_phone,
                self.payment_status,
            ),
        )
        db.commit()
        cursor.close()
        db.close()

    def update(self, response):
        if not valid_statuses.__contains__(self.payment_status):
            return False  # or raise error
        transaction_time_millis = response["transaction_time_millis"] / 1000.0
        transaction_time = datetime.datetime.fromtimestamp(transaction_time_millis).strftime(
            "%Y-%m-%d %H:%M:%S.%f"
        )
        json_res = json.dumps(response)
        sql = """update orders set payment_status = %s, transaction_time = %s, rec_trade_id=%s, response=%s
                where order_number = %s"""
        db = connection_pool.get_connection()
        cursor = db.cursor()
        cursor.execute(
            sql,
            (
                self.payment_status,
                transaction_time,
                response["rec_trade_id"],
                json_res,
                self.order_number,
            ),
        )
        db.commit()
        cursor.close()
        db.close()

    def search_by_order_number(order_number):
        sql = """select orders.order_number, orders.attraction_id, orders.booking_date, orders.booking_time, orders.booking_price, 
        orders.contact_name, orders.contact_email, orders.contact_phone, orders.payment_status, attractions.name, 
        attractions.address, attractions.images from orders
        inner join attractions
        on orders.attraction_id = attractions.id
        where order_number = %s"""
        db = connection_pool.get_connection()
        cursor = db.cursor()
        cursor.execute(sql, (order_number,))
        infos = cursor.fetchone()
        cursor.close()
        db.close()
        return infos
