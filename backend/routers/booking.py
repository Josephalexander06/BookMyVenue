from fastapi import Depends,APIRouter,status, HTTPException
from .auth import get_current_user
from utils.db_helper import get_db
from sqlalchemy.orm import Session
from utils.schema import Bookings
import models 
from pydantic import field_validator
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
    
    v_id = db.query(models.Venue).filter(models.Venue.name == book.name).first()

    if v_id is None:
        raise HTTPException(status_code=404,detail="Venue not found")
    
    today = date.today()
    if book.booking_date < today:
        raise HTTPException(status_code=404,detail="Cant book older date")
    
    new_booking = models.Booking(
        user_id = current_user[0],
        venue_id = v_id.id,
        booking_date = book.booking_date,
        created_at = ist_now
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    return new_booking