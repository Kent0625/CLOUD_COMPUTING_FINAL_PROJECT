import sys, os
import json

# Fix import path for standalone execution
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import models, database
from database import SessionLocal, engine

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
            ]),
            "fit_details": "Structured silhouette, falls below the knee.",
            "fabric_details": "80% Virgin Wool, 20% Nylon.",
            "condition_details": "Rated 8/10. Light pilling on cuffs.",
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
            "fit_details": "Classic trucker fit. Hits at the hip.",
            "fabric_details": "100% Cotton heavy denim.",
            "condition_details": "Perfectly distressed character.",
        },
        {
            "archive_id": "ARC-0043",
            "name": "Silk Floral Blouse",
            "era": "Circa 1970s",
            "brand": "VALENTINO ARCHIVE",
            "srp": 8500.0,
            "price": 3200.0,
            "size": "S / EU 36",
            "color": "Emerald",
            "status": "available",
            "images": json.dumps([
                "https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?w=900&q=85",
            ]),
            "fit_details": "Flowy, bohemian silhouette with puffed sleeves.",
            "fabric_details": "100% Mulberry Silk.",
            "condition_details": "Pristine condition. No visible flaws.",
        },
        {
            "archive_id": "ARC-0044",
            "name": "Leather Biker Boots",
            "era": "Circa 2005",
            "brand": "DR. MARTENS VINTAGE",
            "srp": 9200.0,
            "price": 4100.0,
            "size": "9 US / 42 EU",
            "color": "Cherry Red",
            "status": "available",
            "images": json.dumps([
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=85",
            ]),
            "fit_details": "True to size. High ankle support.",
            "fabric_details": "Full grain cowhide leather.",
            "condition_details": "Well broken in. Minor scuffs on toe box.",
        }
    ]

    for p_data in products:
        p = models.Product(**p_data)
        db.add(p)
    
    db.commit()
    print(f"Database seeded successfully with {len(products)} products.")

if __name__ == "__main__":
    seed()
