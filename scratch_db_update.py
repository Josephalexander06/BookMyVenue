import sys
import os

sys.path.append("/home/joseph/Project/BookMyVenue")

from backend.utils.db_helper import SessionLocal
from backend import models

db = SessionLocal()
try:
    slots = db.query(models.TimeSlot).all()
    updated = 0
    for s in slots:
        needs_update = False
        if s.price_per_day is None:
            s.price_per_day = 1000.0
            needs_update = True
        if s.price_per_hour is None:
            s.price_per_hour = 120.0
            needs_update = True
        if needs_update:
            updated += 1
    db.commit()
    print(f"Successfully updated {updated} timeslot records with default prices.")
finally:
    db.close()
