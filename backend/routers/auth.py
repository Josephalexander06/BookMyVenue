from fastapi import Security,Depends,HTTPException
from jose import JWTError,jwt
from fastapi.security import OAuth2PasswordBearer
from utils.schema import Settings


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/verify-otp")

def get_current_user(token:str = Security(oauth2_scheme)):
    try:
        payload = jwt.decode(token,Settings.SECRET_KEY,algorithms=[Settings.ALGORITHM])
        phone : str = payload.get("sub")

        if phone is None:
            raise HTTPException(status_code=404,detail="Invalid credentials")
        return phone
    except JWTError:
        raise HTTPException(status_code=404,detail="Invalid credentials")


