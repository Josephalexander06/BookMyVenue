from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    DATABASE_URL: str   
    RAZORPAY_SECRET_KEY : str
    RAZORPAY_API_KEY : str


    # GOOGLE_CLIENT_ID: str
    # GOOGLE_SECRET_ID: str

    model_config = SettingsConfigDict(
        env_file=".env"
    )

settings = Settings()