from fastapi import Depends,status,HTTPException,APIRouter
from utils.db_helper import get_db
from utils.schema import CreateUser,OTP, Bookings, Venue
from utils.config import settings
from models import OTPVerification,User
from sqlalchemy.orm import Session
from jose import jwt
from .auth  import get_current_user
from datetime import datetime,timedelta
from passlib.context import CryptContext
import random
from zoneinfo import ZoneInfo



router = APIRouter(
    prefix="/user",
    tags=["User"]
)

pwd_content = CryptContext(schemes=["bcrypt"],deprecated ="auto")

def access_required(current_user : tuple = Depends(get_current_user)):
    allowed_roles  ={'owner','admin'}

    if current_user[1] not in allowed_roles:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Access Required")

    return current_user



def admin_required(current_user : int = Depends(get_current_user)):
    if current_user[1] != 'admin':
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Access Required")
    return current_user


ist_now = datetime.now(ZoneInfo("Asia/Kolkata"))


def send_otp_verification(phone_number:str,db:Session):
    otp = str(random.randint(100000,999999))
    expire_at = ist_now + timedelta(minutes=5)
    otp_hashed =  pwd_content.hash(otp)
    otp_record = OTPVerification(
        phone_number = phone_number,
        otp_hash = otp_hashed,
        created_at = ist_now,
        expire_at = expire_at
    )
    db.add(otp_record)
    db.commit()
    return otp


def verify_otp(phone_number:str,submitted_code:str,db:Session):

    stmt = db.query(OTPVerification).filter(
        OTPVerification.phone_number == phone_number, OTPVerification.is_used == False, OTPVerification.expire_at > ist_now
    ).order_by(OTPVerification.expire_at.desc()).first()

    if not stmt:
        raise HTTPException(status_code=404,detail="Invalid or expire otp")

    if not pwd_content.verify(submitted_code,stmt.otp_hash):
        raise HTTPException(status_code=404,detail="Invalid otp")
    
    stmt.is_used = True
    db.commit()

    return True 



@router.post("/auth/send-otp")
async def get_phone_no(phone_no:CreateUser,db:Session=Depends(get_db)):
    
   otp =  send_otp_verification(phone_no.phone_no,db)

   return {"message":"OTP genearted","otp":otp}

@router.post("/auth/verify-otp",status_code=status.HTTP_200_OK)
async def check_otp(payload:OTP,db:Session=Depends(get_db)):

    verify_otp(payload.phone_no,payload.otp,db)

    db_user = db.query(User).filter(User.phone_number == payload.phone_no).first()
    if not db_user:
        db_user = User(
            phone_number = payload.phone_no,
            is_verified = True
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    
    expire = ist_now + timedelta(days=7)


    token = jwt.encode(
        {
            "sub": str(db_user.id),
            "role": db_user.role,
            "exp": expire
        },
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

    return {"access_token": token, "token_type": "bearer"}
    
      

@router.get("/",status_code=status.HTTP_200_OK)
async def get_user(db: Session = Depends(get_db),current_user : int = Depends(get_current_user)):

    users = db.query(User).filter(User.id == current_user[0]).first()

    print(users)

    if not users:
        raise HTTPException(status_code=404,detail="user Not Found")
    
    return {"phone_number":users.phone_number}



