from fastapi import FastAPI, Request
from routers import booking,users,venue
from utils.db_helper import Base, engine
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


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

# @app.middleware("http")
# async def log_time(request:Request,call_next):
#     start = time.perf_counter()

#     response = await call_next(request)

#     duaration = time.perf_counter() - start
#     print(f"{request.url.path}:{duaration:.3f}s")

#     return response


app.include_router(booking.router)
app.include_router(users.router)
app.include_router(venue.router)
# app.include_router(google_auth.router)

app.mount("/uploads",StaticFiles(directory="upload"),name="uploads")


@app.get("/")
def home():
    return {"message": "Welcome to FastAPI OAuth2 Authentication!"}