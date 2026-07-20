from sqlalchemy import create_engine
from fastapi import FastAPI, Depends
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from utils.config import Settings
from functools import lru_cache
from dotenv import load_dotenv
import os

load_dotenv()
app = FastAPI()

@lru_cache
def get_settings():
    return Settings()

SQLALCHEMY_DATABASE  = os.environ['DATABASE_URL']

engine = create_engine(SQLALCHEMY_DATABASE)

SessionLocal = sessionmaker(autoflush=False,autocommit=False,bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()