from fastapi import Depends,APIRouter,status, HTTPException
from backend.routers.auth import get_current_user
from backend.utils.db_helper import get_db
from sqlalchemy.orm import Session
from backend.utils.schema import Bookings, Booking_Owner, OrderCreate, PayemntVerification, Ratings
from backend.models import Booking, Venue, User, Transactions, Rating
from pydantic import field_validator
from backend.routers.users import access_required,admin_required
from datetime import date,datetime
from zoneinfo import ZoneInfo
import razorpay
import hmac
import hashlib
from backend.utils.config import settings
from typing import List, Optional




router = APIRouter(
    prefix="/booking",
    tags=["Booking"]
)

ist_now = datetime.now(ZoneInfo("Asia/Kolkata"))

client = razorpay.Client(auth=(settings.RAZORPAY_API_KEY,settings.RAZORPAY_SECRET_KEY))

@router.post("/",status_code=status.HTTP_201_CREATED,response_model=Bookings)
def create_booking(book:Bookings,db:Session = Depends(get_db),current_user : int = Depends(get_current_user)):
    
    if book.venue_id is not None:
        v_id = db.query(Venue).filter(Venue.id == book.venue_id).with_for_update().first()
    else:
        v_id = db.query(Venue).filter(Venue.name == book.name).with_for_update().first()

    if v_id is None:
        raise HTTPException(status_code=404,detail="Venue not found")
    
    today = date.today()
    booking_day = book.start_time.date() if isinstance(book.start_time, datetime) else book.start_time
    if booking_day is not None and  booking_day < today:
        raise HTTPException(status_code=404,detail="Cant book older date")
    
    start_t = book.start_time
    end_t = book.end_time
    if start_t is None:
        start_t = datetime.combine(booking_day, datetime.min.time()).replace(tzinfo=ZoneInfo("Asia/Kolkata"))
    if end_t is None:
        end_t = datetime.combine(booking_day, datetime.max.time()).replace(tzinfo=ZoneInfo("Asia/Kolkata"))

    # Check for active (pending or approved) booking overlaps
    check_booking = db.query(Booking).filter(
        Booking.venue_id == v_id.id,
        Booking.status.in_(["PENDING", "APPROVED"]),
        Booking.start_time < end_t,
        Booking.end_time > start_t
    ).first()

    if check_booking:
        raise HTTPException(status_code=400,detail="Venue already Booked")

    new_booking = Booking(
        user_id = current_user[0],
        venue_id = v_id.id,
        booking_mode = book.mode or "DAILY",
        start_time = start_t,
        end_time = end_t,
        booking_date = start_t,
        created_at = ist_now
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    return new_booking

@router.get("/",response_model=list[Booking_Owner])
def recieved_request(db:Session = Depends(get_db),current_user : tuple = Depends(get_current_user)):

    if current_user[1] == 'admin':
        bookings = db.query(Booking, Venue, User).join(Venue, Booking.venue_id == Venue.id).join(User, Booking.user_id == User.id).all()
    else:
        bookings = db.query(Booking, Venue, User).join(Venue, Booking.venue_id == Venue.id).join(User, Booking.user_id == User.id).filter(Venue.owner_id == current_user[0]).all()

    result = []

    for booking, venue, user in bookings:
        rating_val = db.query(Rating.ratings).filter(Rating.booking_id == booking.id).scalar()
        result.append({
            "id": booking.id,
            "name": venue.name,
            "address": venue.address,
            "booking_date": booking.booking_date,
            "status": booking.status,
            "venue_id": venue.id,
            "customer_name": user.phone_number,
            "rating": rating_val
        })
    
    return result

@router.patch("/{id}/approve")
def booking_approvel(id : int,db:Session=Depends(get_db),current_user : tuple = Depends(access_required)):

    booking_approval = db.query(Venue,Booking).join(Booking,Booking.venue_id == Venue.id).filter(Venue.owner_id == current_user[0]).filter(Booking.id == id).first()
    if not booking_approval:
        raise HTTPException(status_code=404,detail="Not Found")
    v ,b = booking_approval
    b.status = "APPROVED"
    db.commit()
    db.refresh(b)

    return {"Approved"}


@router.patch("/{id}/reject")
def booking_rejection(id : int,db:Session=Depends(get_db),current_user : tuple = Depends(access_required)):


    booking_rejection = db.query(Venue,Booking).join(Booking,Booking.venue_id == Venue.id).filter(Venue.owner_id == current_user[0]).filter(Booking.id == id).first()
    if not booking_rejection:
        raise HTTPException(status_code=404,detail="Not Found")
    
    v, b = booking_rejection
    b.status = "REJECTED"
    db.commit()
    db.refresh(b)

    return {"Rejected"}


@router.patch("/{id}/cancel")
def booking_cancellation(id : int,db:Session=Depends(get_db),current_user : tuple = Depends(get_current_user)):

    booking = db.query(Booking).filter(Booking.id == id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.user_id != current_user[0]:
        raise HTTPException(status_code=403, detail="You can only cancel your own bookings")

    booking.status = "CANCELLED"
    db.commit()

    return {"updated"}


@router.get("/mybooking")
def my_bookings(db:Session = Depends(get_db),current_user : tuple = Depends(get_current_user)):

    bookings = db.query(Booking,Venue).join(Venue,Booking.venue_id == Venue.id).filter(Booking.user_id == current_user[0]).all()
    result = []

    for book,venue in bookings:
        rating_val = db.query(Rating.ratings).filter(Rating.booking_id == book.id).scalar()
        # if book.status == "APPROVED":
        result.append({
            "id": book.id,
            "name":venue.name,
            "address":venue.address,
            "booking_date":book.booking_date,
            "status":book.status,
            "venue_id": venue.id,
            "rating": rating_val
        })

    return result


@router.post("/create-order")
def create_payment_order(data:OrderCreate,db:Session = Depends(get_db),current_user : tuple = Depends(get_current_user)):
    amount_in_paise  = int(data.amount * 100)

    order_data = {
        "amount":amount_in_paise,
        "currency":data.currency,
        # "recepit":data.recepit,
        "payment_capture":1
    }

    try:
        razorpay_order =  client.order.create(data=order_data)

        db_transaction = Transactions(
            order_id = razorpay_order['id'],
            amount = data.amount,
            currency = data.currency,
            user_id = current_user[0]
        )

        db.add(db_transaction)
        db.commit()

        return razorpay_order
    except Exception as e:
        raise HTTPException(status_code=404,detail=str(e))
    
@router.post("/verify-payment")
def verify_payment_signature(payload:PayemntVerification,db:Session = Depends(get_db)):

    msg = f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}"

    generate_signature = hmac.new(
        settings.RAZORPAY_SECRET_KEY.encode('utf-8'),
        msg.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    if generate_signature == payload.razorpay_signature:
        transaction = db.query(Transactions).filter(Transactions.order_id == payload.razorpay_order_id).first()

        if transaction:
            transaction.payment_id = payload.razorpay_payment_id
            transaction.status = "captured"
            db.commit()
            return {"status":"success","messgae":"Payemnt verified"}
        else:
            raise HTTPException(status_code=404,detail="Order not found")
    else:
        raise HTTPException(status_code=404,detail="Invalid signature")
    
@router.post("/rating")
def create_rating(rating:Ratings,db:Session = Depends(get_db),current_user: tuple = Depends(get_current_user)):
    booking_id = int(rating.id)

    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == current_user[0]
    ).first()
    
    if not booking :
        raise HTTPException(status_code=404,detail="No booking found")


    rate = db.query(Rating).filter(Rating.booking_id == booking_id).first()

    if rate:
        raise HTTPException(status_code=409,detail="already rated")
        
   
    rating_record = Rating(
            user_id=booking.user_id,
            booking_id=booking.id,
            ratings=rating.ratings,
        )


    db.add(rating_record)
    db.commit()

    return {"msg":"rating seted"}

@router.patch("/rating")
def update_rating(rating:Ratings,db:Session = Depends(get_db),current_user: tuple = Depends(get_current_user)):

    booking_id = int(rating.id)

    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == current_user[0]
    ).first()
    
    if not booking :
        raise HTTPException(status_code=404,detail="No booking found")

    rating_update = db.query(Rating).filter(Rating.booking_id == booking.id).first()

    rating_update.ratings = rating.ratings 

    db.commit()
    return {"updated"}
    