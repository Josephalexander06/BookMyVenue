from fastapi import Depends,APIRouter,status, HTTPException
from .auth import get_current_user
from utils.db_helper import get_db
from sqlalchemy.orm import Session
from utils.schema import Bookings, Booking_Owner
from models import Booking, Venue, User
from pydantic import field_validator
from .users import access_required,admin_required
from datetime import date,datetime
from zoneinfo import ZoneInfo



router = APIRouter(
    prefix="/booking",
    tags=["Booking"]
)

ist_now = datetime.now(ZoneInfo("Asia/Kolkata"))

@router.post("/",status_code=status.HTTP_201_CREATED,response_model=Bookings)
def create_booking(book:Bookings,db:Session = Depends(get_db),current_user : int = Depends(get_current_user)):
    
    # Query with row lock on the venue to prevent race conditions during concurrent bookings
    if book.venue_id is not None:
        v_id = db.query(Venue).filter(Venue.id == book.venue_id).with_for_update().first()
    else:
        v_id = db.query(Venue).filter(Venue.name == book.name).with_for_update().first()

    if v_id is None:
        raise HTTPException(status_code=404,detail="Venue not found")
    
    today = date.today()
    booking_day = book.booking_date.date() if isinstance(book.booking_date, datetime) else book.booking_date
    if booking_day < today:
        raise HTTPException(status_code=404,detail="Cant book older date")
    
    # Defensively compute start/end times if null
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
        booking_date = book.booking_date,
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
        result.append({
            "id": booking.id,
            "name": venue.name,
            "address": venue.address,
            "booking_date": booking.booking_date,
            "status": booking.status,
            "venue_id": venue.id,
            "customer_name": user.phone_number
        })
    
    return result

@router.patch("/{id}/approve")
def booking_approvel(id : int,db:Session=Depends(get_db),current_user : tuple = Depends(access_required)):

    booking_approval = db.query(Booking).filter(Booking.id == id).first()
    booking_approval.status = "APPROVED"
    db.commit()

    return {"updated"}


@router.patch("/{id}/reject")
def booking_rejection(id : int,db:Session=Depends(get_db),current_user : tuple = Depends(access_required)):

    booking_approval = db.query(Booking).filter(Booking.id == id).first()
    booking_approval.status = "REJECTED"
    db.commit()

    return {"updated"}


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
        # if book.status == "APPROVED":
            result.append({
                "id": book.id,
                "name":venue.name,
                "address":venue.address,
                "booking_date":book.booking_date,
                "status":book.status,
                "venue_id": venue.id
            })

    return result

