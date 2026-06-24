import os
from uuid_extensions import uuid7
from fastapi import Depends,status,HTTPException,Response,APIRouter, Query,UploadFile,File
from backend.utils.db_helper import get_db
from backend.utils.schema import CreateVenue, GetVenue, Ratings
from backend import models
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.routers.users import access_required
import requests
from geoalchemy2.functions import ST_DWithin, ST_MakePoint, ST_SetSRID, ST_Distance
from sqlalchemy import func
from backend.routers.auth import get_current_user

router = APIRouter(
    prefix="/venues",
    tags=["Venue"]
)

UPLOAD_DIR  = "upload"
os.makedirs(UPLOAD_DIR,exist_ok=True)



@router.post("/",status_code=status.HTTP_201_CREATED,response_model=List[GetVenue])
async def create_venue(Venues:CreateVenue = Depends(CreateVenue.as_form),images:list[UploadFile] = File(default=[]),db:Session=Depends(get_db),
                       current_user:int = Depends(access_required)):

    venue_data = {k: v for k, v in Venues.dict().items() if hasattr(models.Venue, k)}
    # print(venue_data)
    new_venue = models.Venue(**venue_data)
    new_venue.owner_id = current_user[0]

    # Use coordinates if provided by client, otherwise geocode address
    if Venues.latitude is not None and Venues.longitude is not None:
        new_venue.latitude = Venues.latitude
        new_venue.longitude = Venues.longitude
    else:
        coords = geocode(new_venue.address)
        if "error" in coords:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Could not geocode address: {coords['error']}. Please specify map coordinates manually."
            )
        new_venue.latitude = coords["latitude"]
        new_venue.longitude = coords["longitude"]

    new_venue.location = f"POINT({new_venue.longitude} {new_venue.latitude})" 

    db.add(new_venue)
    db.commit()
    db.refresh(new_venue)

    for image in images:
        extension = image.filename.split(".")[-1]
        unique_filename = f"{uuid7()}.{extension}"
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

def geocode(address:str):

    url  = "https://nominatim.openstreetmap.org/search"

    headers = {
        "User-Agent": "Bookmyvenue/1.0" 
    }
    
    query = address
    if "kerala" not in query.lower():
        query = f"{query}, Kerala"

    params = {
        "q":query,
        "format" : "json",
        "limit" : 1,
        "countrycodes": "in"
       }
    
    response  = requests.get(url,params=params,headers=headers)
    response.raise_for_status()

    data = response.json()

    if not data:
        return{"error":"address not found"}

    return {"latitude":float(data[0]["lat"]),"longitude":float(data[0]["lon"])}


@router.get("/Venue",status_code=status.HTTP_200_OK,response_model=List[GetVenue])
async def get_myvenue(db:Session=Depends(get_db),current_user : int = Depends(get_current_user)):
    id = current_user[0]
    venues  = db.query(models.Venue).filter(models.Venue.owner_id == id).all()
    return venues


@router.get("/",status_code=status.HTTP_200_OK,response_model=List[GetVenue])
async def get_venues(search:Optional[str] = Query(None), type:Optional[str] = Query(None), db:Session=Depends(get_db)):

    query = db.query(models.Venue)

    if type is not None:
        query = query.filter(func.lower(models.Venue.type) == type.lower())

    if search is not None:        
        # processed_query = " & ".join(f"{word}:*" for word in q.split())
        # venues  = db.query(models.Venue).filter(models.Venue.search_vector.match(processed_query,postgresql_regconfig="english")).all()

        coord = geocode(search)
        if "error" in coord:
            return []

        search_point = func.ST_GeogFromText(
            f"POINT({coord["longitude"]} {coord["latitude"]})"
        )
                
        query = query.filter(func.ST_DWithin(models.Venue.location,search_point,20000)).order_by(func.ST_Distance(models.Venue.location,search_point))

    venues = query.all()
    return venues



@router.get("/{id}",status_code=status.HTTP_200_OK,response_model=GetVenue)
async def get_venue(id:int,db: Session = Depends(get_db)):
    # print(id)

    venue = db.query(models.Venue).filter(models.Venue.id == id).first()
    if not venue:
        raise HTTPException(status_code=404,detail="Venue Not Found")
    
    avg_rating, user_cut = db.query(func.avg(models.Rating.ratings),func.count(models.Rating.id)).select_from(models.Booking).join(
        models.Rating,models.Booking.id == models.Rating.booking_id).filter(models.Booking.venue_id == id).first() or (0,0,0)
    

    images = db.query(models.ImageMetaData).filter(models.ImageMetaData.venue_id == venue.id).all()
    venue.images = images
    venue.rating = avg_rating  
    venue.user_count = user_cut

    return  venue


@router.put("/{id}",status_code=status.HTTP_200_OK,response_model=GetVenue)
async def update_venue(id:int,updated_data:CreateVenue,db:Session=Depends(get_db)):
    fetch_venue = db.query(models.Venue).filter(models.Venue.id == id)
    exiting_v = fetch_venue.first()

    if not exiting_v:
        raise HTTPException(status_code=404,detail="Venue Not Found")

    venue_data = {k: v for k, v in updated_data.dict().items() if hasattr(models.Venue, k)}
    
    if venue_data.get('latitude') is not None and venue_data.get('longitude') is not None:
        pass
    else:
        # If coordinates are not provided, only try to geocode if the address actually changed
        if exiting_v.address != updated_data.address:
            coords = geocode(updated_data.address)
            if "error" not in coords:
                venue_data['latitude'] = coords["latitude"]
                venue_data['longitude'] = coords["longitude"]
            else:
                # If geocoding fails, fallback to existing coordinates to avoid DB null constraint violations
                venue_data['latitude'] = exiting_v.latitude
                venue_data['longitude'] = exiting_v.longitude
        else:
            # Preserve existing coordinates
            venue_data['latitude'] = exiting_v.latitude
            venue_data['longitude'] = exiting_v.longitude

    venue_data['search_vector'] = func.to_tsvector('english', updated_data.name + ' ' + updated_data.address)
    venue_data['location'] = f"POINT({venue_data['longitude']} {venue_data['latitude']})"
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
