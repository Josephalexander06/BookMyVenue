import sys
import os

# Add backend directory to sys.path
sys.path.append("/home/joseph/Project/BookMyVenue")

from backend.utils.db_helper import SessionLocal
from backend import models

db = SessionLocal()
try:
    print("--- VENUES ---")
    venues = db.query(models.Venue).all()
    for v in venues:
        print(f"ID: {v.id}, Name: {v.name}, AllowedModes: {v.booking_allowed_mode}")
        
    print("\n--- TIMESLOTS ---")
    slots = db.query(models.TimeSlot).all()
    for s in slots:
        print(f"VenueID: {s.venue_id}, Day: {s.day_of_week}, Opens: {s.opens}, Closes: {s.closes}, PriceDay: {s.price_per_day}, PriceHour: {s.price_per_hour}")
finally:
    db.close()
