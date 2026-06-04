import os
import uuid
from fastapi import Depends,status,HTTPException,Response,APIRouter, Query,UploadFile,File
from utils.db_helper import get_db
from utils.schema import CreateVenue, GetVenue
import models
from sqlalchemy.orm import Session
from typing import List, Optional
from .users import access_required

from .auth import get_current_user

router = APIRouter(
    prefix="/venues",
    tags=["Venue"]
)

UPLOAD_DIR  = "upload"
os.makedirs(UPLOAD_DIR,exist_ok=True)



@router.post("/",status_code=status.HTTP_201_CREATED,response_model=List[CreateVenue])
async def create_venue(Venues:CreateVenue = Depends(CreateVenue.as_form),images:list[UploadFile] = File(...),db:Session=Depends(get_db),current_user:int = Depends(access_required)):

    venue_data = {k: v for k, v in Venues.dict().items() if hasattr(models.Venue, k)}
    new_venue = models.Venue(**venue_data)
    new_venue.owner_id = current_user[0]
    db.add(new_venue)
    db.commit()
    db.refresh(new_venue)

    for image in images:
        extension = image.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{extension}"
        filepath = os.path.join(UPLOAD_DIR,unique_filename)

        content = await image.read()
        with open(filepath,"wb") as f:
            f.write(content)

        image_record = models.ImageMetaData(
            image_name = image.filename,
            image_path = filepath,
            venue_id = new_venue.id
        )
        db.add(image_record)

    db.commit()

    return [new_venue]


@router.get("/Venue",status_code=status.HTTP_200_OK,response_model=List[GetVenue])
async def get_myvenue(db:Session=Depends(get_db),current_user : int = Depends(get_current_user)):
    id = current_user[0]
    venues  = db.query(models.Venue).filter(models.Venue.owner_id == id).all()
    return venues


@router.get("/",status_code=status.HTTP_200_OK,response_model=List[GetVenue])
async def get_venues(q:Optional[str] = Query(None),db:Session=Depends(get_db)):

    if q is not None:
        processed_query = " & ".join(f"{word}:*" for word in q.split())

        venues  = db.query(models.Venue).filter(models.Venue.search_vector.match(processed_query,postgresql_regconfig="english")).all()
    else:
        venues  = db.query(models.Venue).all()
    return venues



@router.get("/{id}",status_code=status.HTTP_200_OK,response_model=GetVenue)
async def get_venue(id:int,db: Session = Depends(get_db)):
    # print(id)

    venue = db.query(models.Venue).filter(models.Venue.id == id).first()
    if not venue:
        raise HTTPException(status_code=404,detail="Venue Not Found")
    
    images = db.query(models.ImageMetaData).filter(models.ImageMetaData.venue_id == venue.id).all()
    venue.images = images
    
    return  venue


@router.put("/{id}",status_code=status.HTTP_200_OK,response_model=GetVenue)
async def update_venue(id:int,updated_data:CreateVenue,db:Session=Depends(get_db)):
    fetch_venue = db.query(models.Venue).filter(models.Venue.id == id)
    exiting_v = fetch_venue.first()

    if not fetch_venue:
        raise HTTPException(status_code=404,detail="Venue Not Found")

    venue_data = {k: v for k, v in updated_data.dict().items() if hasattr(models.Venue, k)}
    from sqlalchemy import func
    venue_data['search_vector'] = func.to_tsvector('english', updated_data.name + ' ' + updated_data.address)
    fetch_venue.update(venue_data,synchronize_session=False)
    db.commit()
    
    updated_venue = fetch_venue.first()
    return updated_venue



@router.delete("/{id}",status_code=status.HTTP_204_NO_CONTENT)
async def delete_venue(id:int,db:Session=Depends(get_db)):
    venue_query = db.query(models.Venue).filter(models.Venue.id == id)
    venue = venue_query.first()

    if not venue_query:
        raise HTTPException(status_code=404,detail="Venue Not Found")

    venue_query.delete(synchronize_session=False)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{id}/booked-dates")
def get_bookeddates(id:int,db:Session = Depends(get_db)):
    booked = db.query(models.Booking).filter(
        models.Booking.venue_id == id,
        models.Booking.status.in_(["PENDING", "APPROVED"])
    ).all()
    result = []
    for b in booked:
        result.append({
            "booking_date": b.booking_date.isoformat() if b.booking_date else None,
            "start_time": b.start_time.isoformat() if b.start_time else None,
            "end_time": b.end_time.isoformat() if b.end_time else None,
            "booking_mode": b.booking_mode
        })
    return result   

