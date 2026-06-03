from pydantic import BaseModel,Field
from pydantic_settings import BaseSettings
from datetime import datetime,date
from typing import Optional


class Venue(BaseModel):
    name : str
    address : str
    price : float
    capacity : int | None = None

    class Config:
        from_attributes = True

class CreateVenue(Venue):
    class Config:
        from_attributes = True

class GetVenue(Venue):
    id : int
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
       booking_date : date 
       class Config:
        from_attributes = True
    
class Booking_Owner(Bookings):
    id : int
    status : str
    address : Optional[str] = None
    venue_id : Optional[int] = None
    customer_name : Optional[str] = None

