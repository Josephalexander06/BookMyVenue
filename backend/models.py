from utils.db_helper import Base
from sqlalchemy import Column,Integer,TIMESTAMP,String,Float,Boolean,text,DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import TSVECTOR


class Venue(Base):
    __tablename__ =   "venues"

    id = Column(Integer,primary_key=True,nullable=False)
    name = Column(String,nullable=False)
    address = Column(String,nullable=False)
    price = Column(Float,nullable=False)
    capacity = Column(Integer,nullable=True)
    availability = Column(Boolean,server_default='TRUE')
    created_at = Column(TIMESTAMP(timezone=True),server_default=text('now()')) 
    owner_id = Column(Integer,ForeignKey("users.id", ondelete="CASCADE"),nullable=False)
    search_vector  = Column(TSVECTOR,nullable=False)

    owner  = relationship("User",back_populates="venues")
    bookings = relationship("Booking",back_populates="venue")
 

class User(Base):
    __tablename__ =   "users"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, unique=True, index=True, nullable=False)
    is_verified = Column(Boolean, default=False)
    account_status = Column(Boolean,server_default='TRUE')
    role = Column(String, nullable=False, default="customer")
    created_at = Column(TIMESTAMP(timezone=True),server_default=text('now()')) 

    venues = relationship("Venue",back_populates="owner",cascade="all,delete")
    bookings = relationship("Booking",back_populates="user")

class OTPVerification(Base):
    __tablename__ = "otp_verification"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, index=True, nullable=False)
    otp_hash = Column(String,nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False)
    expire_at = Column(DateTime(timezone=True),nullable=False)
    is_used = Column(Boolean,default=False)

class Booking(Base):
    __tablename__ = 'bookings'

    id = Column(Integer,primary_key=True,nullable=False)
    user_id =  Column(Integer,ForeignKey("users.id"),nullable=False)
    venue_id = Column(Integer,ForeignKey("venues.id"),nullable=False)

    booking_date = Column(DateTime(timezone=True),nullable=False)
    status = Column(String,default="PENDING")
    created_at = Column(TIMESTAMP(timezone=True),server_default=text('now()')) 

    venue = relationship("Venue",back_populates="bookings")
    user  = relationship("User",back_populates="bookings")

