from fastapi import Depends,status,HTTPException,APIRouter
from utils.db_helper import get_db
from utils.schema import CreateUser,OTP
from utils.config import settings
from models import OTPVerification,User
from sqlalchemy.orm import Session
from jose import jwt
from datetime import datetime,timedelta
from passlib.context import CryptContext
import random


router = APIRouter(
    prefix="/user",
    tags=["User"]
)
pwd_content = CryptContext(schemes=["bcrypt"],deprecated ="auto")



def send_otp_verification(phone_number:str,db:Session):
    otp = str(random.randint(100000,999999))
    expire_at = datetime.utcnow() + timedelta(minutes=5)
    # print(otp)
    safe_otp = otp[:72] 
    otp_hashed =  pwd_content.hash(safe_otp)
    otp_record = OTPVerification(
        phone_number = phone_number,
        otp_hash = otp_hashed,
        created_at = datetime.utcnow(),
        expire_at = expire_at
    )
    db.add(otp_record)
    db.commit()
    return otp


def verify_otp(phone_number:str,submitted_code:str,db:Session):

    stmt = db.query(OTPVerification).filter(
        OTPVerification.phone_number == phone_number, OTPVerification.is_used == False, OTPVerification.expire_at > datetime.utcnow()
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
    
    expire = datetime.utcnow() + timedelta(days=7)


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
    
      

@router.get("/user/{id}",status_code=status.HTTP_200_OK,response_model=CreateUser)
async def get_user(id:int,db: Session = Depends(get_db)):
    # print(id)

    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404,detail="user Not Found")
    
    return user
