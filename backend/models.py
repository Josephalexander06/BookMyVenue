from utils.db_helper import Base
from sqlalchemy import Column,Integer,TIMESTAMP,String,Float,Boolean,text,DateTime, Enum
import enum

class Venue(Base):
    __tablename__ =   "Venues"

    id = Column(Integer,primary_key=True,nullable=False)
    name = Column(String,nullable=False)
    location = Column(String,nullable=False)
    price = Column(Float,nullable=False)
    capacity = Column(Integer,nullable=True)
    availability = Column(Boolean,server_default='TRUE')
    created_at = Column(TIMESTAMP(timezone=True),server_default=text('now()')) 

class User(Base):
    __tablename__ =   "users"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, unique=True, index=True, nullable=False)
    is_verified = Column(Boolean, default=False)
    account_status = Column(Boolean,server_default='TRUE')
    role = Column(String, nullable=False, default="customer")
    created_at = Column(TIMESTAMP(timezone=True),server_default=text('now()')) 

class OTPVerification(Base):
    __tablename__ = "otp_verification"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, index=True, nullable=False)
    otp_hash = Column(String,nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False)
    expire_at = Column(DateTime(timezone=True),nullable=False)
    is_used = Column(Boolean,default=False)
