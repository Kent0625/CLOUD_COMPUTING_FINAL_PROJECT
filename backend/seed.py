from sqlalchemy.orm import Session
import json
from . import models, database
from .database import SessionLocal, engine

def seed():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if products already exist
    if db.query(models.Product).count() > 0:
        print("Database already seeded.")
        return

    products = [
        {
            "archive_id": "ARC-0041",
            "name": "Wool Overcoat",
            "era": "Circa 1990s",
            "brand": "UNIQLO ARCHIVE",
            "srp": 4200.0,
            "price": 1150.0,
            "size": "M / US 38R",
            "color": "Bone",
            "status": "available",
            "images": json.dumps([
                "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&q=85",
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900&q=85",
                "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=85",
            ]),
            "fit_details": "A structured, slightly boxy silhouette. The hem falls just below the knee. Shoulders sit true-to-size with a natural, unpadded line. Best worn over a light knit or tailored trouser.",
            "fabric_details": "80% Virgin Wool, 20% Nylon. Shell is substantial—around 400gsm. Hand-feel is smooth with a slight pebble texture. Fully lined in a silky viscose blend.",
            "condition_details": "Rated 8/10. Light pilling on the inner sleeve cuffs, visible only upon close inspection. A faint 1cm horizontal crease on the left lapel that does not affect drape. No missing buttons. All seams intact. Dry-cleaned before listing.",
        },
        {
            "archive_id": "ARC-0042",
            "name": "Vintage Denim Jacket",
            "era": "Circa 1980s",
            "brand": "LEVI'S VINTAGE",
            "srp": 5500.0,
            "price": 2450.0,
            "size": "L / US 42",
            "color": "Indigo",
            "status": "available",
            "images": json.dumps([
                "https://images.unsplash.com/photo-1576871333020-033bc699b685?w=900&q=85",
            ]),
            "fit_details": "Classic trucker fit. Hits at the hip. Roomy through the chest and arms.",
            "fabric_details": "100% Cotton heavy denim. No stretch.",
            "condition_details": "Perfectly distressed. Some fraying at the collar adds to the character.",
        }
    ]

    for p_data in products:
        p = models.Product(**p_data)
        db.add(p)
    
    db.commit()
    print("Database seeded successfully.")

if __name__ == "__main__":
    seed()
