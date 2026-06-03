from fastapi import Depends,APIRouter,status, HTTPException
from .auth import get_current_user
from utils.db_helper import get_db
from sqlalchemy.orm import Session
from utils.schema import Bookings, Booking_Owner
from models import Booking, Venue
from pydantic import field_validator
from .users import access_required,admin_required
from datetime import date,datetime
from zoneinfo import ZoneInfo


router = APIRouter(
    prefix="/booking",
    tags=["Booking"]
)

ist_now = datetime.now(ZoneInfo("Asia/Kolkata"))

@field_validator("booking_date")
@router.post("/",status_code=status.HTTP_201_CREATED,response_model=Bookings)
def create_booking(book:Bookings,db:Session = Depends(get_db),current_user : int = Depends(get_current_user)):
    
    v_id = db.query(Venue).filter(Venue.name == book.name).first()

    if v_id is None:
        raise HTTPException(status_code=404,detail="Venue not found")
    
    today = date.today()
    if book.booking_date < today:
        raise HTTPException(status_code=404,detail="Cant book older date")
    
    new_booking = Booking(
        user_id = current_user[0],
        venue_id = v_id.id,
        booking_date = book.booking_date,
        created_at = ist_now
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    return new_booking

@router.get("/",response_model=list[Booking_Owner])
def recieved_request(db:Session = Depends(get_db),current_user : tuple = Depends(get_current_user)):

    # Import User model to join and retrieve customer details
    from models import User
    
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

