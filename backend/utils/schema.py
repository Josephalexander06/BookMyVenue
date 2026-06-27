from pydantic import BaseModel,Field
from pydantic_extra_types.coordinate import Latitude,Longitude
from pydantic_settings import BaseSettings
from datetime import datetime,date
from typing import Optional
from fastapi import Form


class Venue(BaseModel):
    name : str 
    address : str
    price_per_day : Optional[float] = None
    price_per_hour : Optional[float] = None
    capacity : int | None = None
    booking_allowed_mode : Optional[str] = "BOTH" 
    latitude : Optional[float] = None
    longitude : Optional[float] = None
    type : str

    class Config:
        from_attributes = True

class CreateVenue(Venue):

    @classmethod
    def as_form(
        cls,
        name: str = Form(...),
        address: str = Form(...),
        price_per_day : float |None = Form(None),
        price_per_hour: float | None = Form(None),
        capacity : int = Form(...),
        booking_allowed_mode : str = Form(...),
        latitude: Optional[float] = Form(None),
        longitude: Optional[float] = Form(None),
        type : str = Form(...),
    ):
        return cls(
            name=name,
            address=address,
            price_per_day=price_per_day,
            price_per_hour = price_per_hour,
            capacity=capacity,
            booking_allowed_mode=booking_allowed_mode,
            latitude=latitude,
            longitude=longitude,
            type = type,

        )
class VenueImage(BaseModel):
    id : int
    image_path : str

    class Config:
        from_attributes = True

class GetVenue(Venue):
    id: int
    image : list[VenueImage] = []
    rating : Optional[float] = None
    user_count : Optional[int] = None
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
       booking_date : Optional[datetime] = None  
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
    rating : Optional[float] = None


class Profile(BaseModel):
    first_name : str
    last_name : str
    dob : date
    class Config:
        from_attributes = True


class getSearch(BaseModel):
    latitude : str
    longitude : str
    class Config:
        from_attributes = True

class Nearbycitys(BaseModel):
    lat : Latitude
    lon : Longitude
    km_within:int = Field(gt=0) 
    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    amount : float = Field(...)
    currency : str = Field(default="INR")
    recepit : str
    user_id : Optional[int] = None

class PayemntVerification(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class Ratings(BaseModel):
    id : int
    # user_id : Optional[int] = None
    # venue_id : Optional[int] = None
    ratings: float
    class Config:
        from_attributes = True