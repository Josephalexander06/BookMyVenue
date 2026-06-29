from backend.utils.db_helper import Base
from sqlalchemy import Column,Integer,TIMESTAMP,String,Float,Boolean,text,DateTime, ForeignKey, DECIMAL
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import TSVECTOR
from geoalchemy2 import Geography


class Venue(Base):
    __tablename__ =   "venues"

    id = Column(Integer,primary_key=True,nullable=False)
    name = Column(String,nullable=False)
    address = Column(String,nullable=False)
    latitude = Column(DECIMAL,nullable=False)
    longitude = Column(DECIMAL,nullable=False)
    price_per_day = Column(Float,nullable=True)
    price_per_hour = Column(Float,nullable=True)
    capacity = Column(Integer,nullable=True)
    booking_allowed_mode = Column(String,default="BOTH")
    availability = Column(Boolean,server_default='TRUE')
    created_at = Column(TIMESTAMP(timezone=True),server_default=text('now()')) 
    owner_id = Column(Integer,ForeignKey("users.id", ondelete="CASCADE"),nullable=False)
    search_vector  = Column(TSVECTOR,nullable=False)
    location = Column(Geography("POINT",srid=4326))
    type = Column(String,nullable=False)
    status = Column(String,default="PENDING")

    owner  = relationship("User",back_populates="venues")
    bookings = relationship("Booking",back_populates="venue")
    image = relationship("ImageMetaData",back_populates="venue")
 

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
    owner = relationship("Owner",back_populates="user")
    transaction = relationship("Transactions",back_populates="user")
    rating = relationship('Rating',back_populates="user")


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


    booking_date = Column(DateTime(timezone=True))
    booking_mode = Column(String,nullable=False)
    start_time = Column(DateTime(timezone=True),nullable=False)
    end_time = Column(DateTime(timezone=True),nullable=False)
    status = Column(String,default="PENDING")
    created_at = Column(TIMESTAMP(timezone=True),server_default=text('now()')) 

    venue = relationship("Venue",back_populates="bookings")
    user  = relationship("User",back_populates="bookings")
    ratings = relationship("Rating",back_populates="booking")

class Owner(Base):
    __tablename__ = "owner"

    id = Column(Integer,primary_key=True,nullable=False)
    first_name = Column(String,nullable=False)
    last_name = Column(String,nullable=False)
    dob = Column(DateTime(timezone=True),nullable=False)
    user_id = Column(Integer,ForeignKey("users.id"),nullable=False)
    created_at = Column(TIMESTAMP(timezone=True),server_default=text('now()')) 

    user  = relationship("User",back_populates="owner")


class ImageMetaData(Base):
    __tablename__ = "venue_images"

    id = Column(Integer,primary_key=True,nullable=False)
    image_name = Column(String,nullable=False)
    image_path  = Column(String,nullable=False)
    venue_id = Column(Integer,ForeignKey("venues.id"),nullable=False)

    venue = relationship("Venue",back_populates="image")


class Transactions(Base):
    __tablename__ = "transactions"

    id = Column(Integer,primary_key=True,nullable=False)
    order_id = Column(String,unique=True,nullable=False)
    payment_id = Column(String,nullable=True)
    amount = Column(Float)
    currency = Column(String,default="INR")
    status = Column(String,default="created")
    user_id = Column(Integer,ForeignKey("users.id"),nullable=False)

    user  = relationship("User",back_populates="transaction")

class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer,primary_key=True,nullable=False)
    user_id = Column(Integer,ForeignKey("users.id"),nullable=False)
    booking_id = Column(Integer,ForeignKey("bookings.id"),unique=True,nullable=False)

    ratings = Column(Float,nullable=False)

    user  = relationship("User",back_populates="rating")
    booking  = relationship("Booking",back_populates="ratings")

    created_at = Column(TIMESTAMP(timezone=True),server_default=text('now()')) 

    