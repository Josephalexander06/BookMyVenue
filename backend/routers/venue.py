from fastapi import Depends,status,HTTPException,Response,APIRouter
from utils.db_helper import get_db
from utils.schema import CreateVenue
import models
from sqlalchemy.orm import Session
from typing import List

from .auth import get_current_user

router = APIRouter(
    prefix="/Venues",
    tags=["Venue"]
)


@router.post("/",status_code=status.HTTP_201_CREATED,response_model=CreateVenue)
async def create_venue(Venues:CreateVenue,db:Session=Depends(get_db),current_user:int = Depends(get_current_user)):
    new_venue = models.Venue(**Venues.dict())
    db.add(new_venue)
    db.commit()
    db.refresh(new_venue)
    
    return [new_venue]

@router.get("/",status_code=status.HTTP_200_OK,response_model=List[CreateVenue])
async def get_venue(db:Session=Depends(get_db)):
    venues  = db.query(models.Venue).all()
    return venues

@router.get("/{id}",status_code=status.HTTP_200_OK,response_model=CreateVenue)
async def get_venues(id:int,db: Session = Depends(get_db),current_user:int = Depends(get_current_user)):
    # print(id)

    venue = db.query(models.Venue).filter(models.Venue.id == id).first()
    if not venue:
        raise HTTPException(status_code=404,detail="Venue Not Found")
    
    return venue

@router.put("/{id}",status_code=status.HTTP_200_OK,response_model=CreateVenue)
async def update_venue(id:int,updated_data:CreateVenue,db:Session=Depends(get_db)):
    fetch_venue = db.query(models.Venue).filter(models.Venue.id == id)
    exiting_v = fetch_venue.first()

    if not fetch_venue:
        raise HTTPException(status_code=404,detail="Venue Not Found")

    fetch_venue.update(updated_data.dict(),synchronize_session=False)
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





