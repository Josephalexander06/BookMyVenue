from pydantic import BaseModel,Field
from pydantic_settings import BaseSettings
from datetime import datetime,date
from typing import Optional
from fastapi import Form


class Venue(BaseModel):
    name : str 
    address : str
    city : str 
    price_per_day : Optional[float] = None
    price_per_hour : Optional[float] = None
    capacity : int | None = None
    booking_allowed_mode : Optional[str] = "BOTH" 

    class Config:
        from_attributes = True

class CreateVenue(Venue):

    @classmethod
    def as_form(
        cls,
        name: str = Form(...),
        address: str = Form(...),
        city: str = Form(...),
        price_per_day : float |None = Form(None),
        price_per_hour: float | None = Form(None),
        capacity : int = Form(...),
        booking_allowed_mode : str = Form(...),
    ):
        return cls(
            name=name,
            address=address,
            city=city,
            price_per_day=price_per_day,
            price_per_hour = price_per_hour,
            capacity=capacity,
            booking_allowed_mode=booking_allowed_mode
        )
class VenueImage(BaseModel):
    id : int
    image_path : str

    class Config:
        from_attributes = True

class GetVenue(Venue):
    image : list[VenueImage] = []
    class Config:
        from_attributes = True


class User(BaseModel):
    phone_no : str
    class Config:
        from_attributes = True

class CreateUser(User):
    class Config:
        from_attributes = True

class OTP(BaseModel):
    phone_no : str
    otp : str
    class Config:
        from_attributes = True


class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str = "HS256"

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

class Bookings(BaseModel):
       name : Optional[str] = None
       venue_id : Optional[int] = None
       booking_date : Optional[date] = None  
       start_time : Optional[datetime] = None
       end_time : Optional[datetime] = None
       mode : Optional[str] = None
       class Config:
        from_attributes = True
    
class Booking_Owner(Bookings):
    id : int
    status : str
    address : Optional[str] = None
    venue_id : Optional[int] = None
    name : Optional[str] = None


class Profile(BaseModel):
    first_name : str
    last_name : str
    dob : date
    class Config:
        from_attributes = True