from fastapi import FastAPI      
from routers import booking,users,venue
from utils.db_helper import Base, engine
from fastapi.middleware.cors import CORSMiddleware



Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(booking.router)
app.include_router(users.router)
app.include_router(venue.router)
# app.include_router(google_auth.router)



@app.get("/")
def home():
    return {"message": "Welcome to FastAPI OAuth2 Authentication!"}