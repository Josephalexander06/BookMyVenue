from pydantic import BaseModel
from pydantic_settings import BaseSettings

class Venue(BaseModel):
    name : str
    location : str
    price : float
    availability : bool = True
    capacity : int | None = None

    class Config:
        from_attributes = True

class CreateVenue(Venue):
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
    is_verified : bool = False
    class Config:
        from_attributes = True


class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str = "HS256"

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'



