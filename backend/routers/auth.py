from fastapi import Security,Depends,HTTPException,status
from jose import JWTError,jwt
from fastapi.security import OAuth2PasswordBearer
from utils.config import settings


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/verify-otp")

def get_current_user(token:str = Security(oauth2_scheme)):
    try:
        payload = jwt.decode(token,settings.SECRET_KEY,algorithms=[settings.ALGORITHM])
        phone : str = payload.get("sub")
        role : str = payload.get("role") 

        if phone is None or role is None:
            raise HTTPException(status_code=404,detail="Invalid credentials on auth")
        return phone,role
    except JWTError:
        raise HTTPException(status_code=404,detail="Invalid credentials")