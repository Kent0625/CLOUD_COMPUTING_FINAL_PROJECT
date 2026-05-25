import sys, os
import json

# Fix import path for standalone execution
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import models, database
from database import SessionLocal, engine

def seed():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
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
                "https://images.unsplash.com/photo-1544441893-675973e31985?w=900&q=85",
                "https://images.unsplash.com/photo-1620052481128-44966603a1da?w=900&q=85",
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
                "https://images.unsplash.com/photo-1605763240000-7e93b172d754?w=900&q=85",
                "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=900&q=85",
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
                "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=900&q=85",
                "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=900&q=85",
            ]),
            "fit_details": "True to size. High ankle support.",
            "fabric_details": "Full grain cowhide leather.",
            "condition_details": "Well broken in. Minor scuffs on toe box.",
        },
        {
            "archive_id": "ARC-0045",
            "name": "Workwear Canvas Pants",
            "era": "Circa 1990s",
            "brand": "CARHARTT VINTAGE",
            "srp": 3800.0,
            "price": 1850.0,
            "size": "32W x 30L",
            "color": "Tan",
            "status": "available",
            "images": json.dumps([
                "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=900&q=85",
            ]),
            "fit_details": "Relaxed fit, straight leg.",
            "fabric_details": "12oz 100% Cotton Duck Canvas.",
            "condition_details": "Faded knees, perfectly aged.",
        },
        {
            "archive_id": "ARC-0046",
            "name": "Cashmere Knit Sweater",
            "era": "Circa 2010",
            "brand": "PRADA ARCHIVE",
            "srp": 12000.0,
            "price": 5400.0,
            "size": "M / IT 48",
            "color": "Navy",
            "status": "available",
            "images": json.dumps([
                "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=900&q=85",
                "https://images.unsplash.com/photo-1574180563860-26b282c0dc14?w=900&q=85",
            ]),
            "fit_details": "Slim fit, ribbed collar.",
            "fabric_details": "100% Mongolian Cashmere.",
            "condition_details": "Excellent condition, professionally dry cleaned.",
        },
        {
            "archive_id": "ARC-0047",
            "name": "Leather Chelsea Boots",
            "era": "Circa 2015",
            "brand": "SAINT LAURENT PARIS",
            "srp": 45000.0,
            "price": 18500.0,
            "size": "43 EU / 10 US",
            "color": "Black",
            "status": "available",
            "images": json.dumps([
                "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=900&q=85",
                "https://images.unsplash.com/photo-1605733513597-a8f8d410fe3c?w=900&q=85",
            ]),
            "fit_details": "Narrow fit, 30mm heel.",
            "fabric_details": "Smooth calfskin leather.",
            "condition_details": "Light wear on soles, uppers are perfect.",
        },
        {
            "archive_id": "ARC-0048",
            "name": "Graphic Print T-Shirt",
            "era": "Circa 1994",
            "brand": "NIRVANA VINTAGE",
            "srp": 15000.0,
            "price": 6200.0,
            "size": "XL / US 46",
            "color": "Faded Black",
            "status": "available",
            "images": json.dumps([
                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=85",
            ]),
            "fit_details": "Oversized, boxy fit.",
            "fabric_details": "100% Heavyweight Cotton.",
            "condition_details": "Single stitch, cracked print (desirable).",
        },
        {
            "archive_id": "ARC-0049",
            "name": "Pleated Wool Trousers",
            "era": "Circa 1990s",
            "brand": "COMME DES GARCONS",
            "srp": 16000.0,
            "price": 6800.0,
            "size": "30W x 31L",
            "color": "Charcoal",
            "status": "available",
            "images": json.dumps([
                "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=900&q=85",
                "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=900&q=85",
            ]),
            "fit_details": "Relaxed top block with a clean tapered leg.",
            "fabric_details": "Midweight wool gabardine with soft drape.",
            "condition_details": "Rated 9/10. Freshly pressed with no visible flaws.",
        },
        {
            "archive_id": "ARC-0050",
            "name": "Linen Camp Collar Shirt",
            "era": "Circa 2000s",
            "brand": "ISSEY MIYAKE MEN",
            "srp": 9800.0,
            "price": 3900.0,
            "size": "M / Boxy",
            "color": "Ivory",
            "status": "available",
            "images": json.dumps([
                "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=900&q=85",
                "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&q=85",
            ]),
            "fit_details": "Boxy resort fit with dropped shoulders.",
            "fabric_details": "Breathable linen blend with natural slub texture.",
            "condition_details": "Excellent condition. Minor texture variation from linen.",
        },
        {
            "archive_id": "ARC-0051",
            "name": "Suede Harrington Jacket",
            "era": "Circa 1980s",
            "brand": "RALPH LAUREN VINTAGE",
            "srp": 22000.0,
            "price": 7600.0,
            "size": "L / US 42",
            "color": "Cognac",
            "status": "available",
            "images": json.dumps([
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900&q=85",
                "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&q=85",
                "https://images.unsplash.com/photo-1544441893-675973e31985?w=900&q=85",
            ]),
            "fit_details": "Classic cropped Harrington shape with ribbed hem.",
            "fabric_details": "Soft suede shell with lightweight lining.",
            "condition_details": "Rated 8/10. Gentle patina on sleeve edges.",
        },
        {
            "archive_id": "ARC-0052",
            "name": "Silk Pocket Scarf",
            "era": "Circa 1970s",
            "brand": "HERMES PARIS",
            "srp": 18000.0,
            "price": 5900.0,
            "size": "One Size",
            "color": "Saffron Multi",
            "status": "available",
            "images": json.dumps([
                "https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?w=900&q=85",
                "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=900&q=85",
            ]),
            "fit_details": "Can be worn as a pocket square, neck scarf, or bag accent.",
            "fabric_details": "100% silk twill with hand-rolled edges.",
            "condition_details": "Pristine print. No pulls or staining.",
        },
        {
            "archive_id": "ARC-0053",
            "name": "Minimalist Leather Tote",
            "era": "Circa 2010",
            "brand": "CELINE ARCHIVE",
            "srp": 62000.0,
            "price": 21400.0,
            "size": "Large",
            "color": "Black",
            "status": "available",
            "images": json.dumps([
                "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=900&q=85",
                "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=85",
            ]),
            "fit_details": "Structured carry-all with room for a laptop and daily essentials.",
            "fabric_details": "Smooth calfskin leather with tonal hardware.",
            "condition_details": "Rated 8.5/10. Light creasing, clean interior.",
        },
        {
            "archive_id": "ARC-0054",
            "name": "Mohair Cardigan",
            "era": "Circa 1990s",
            "brand": "YOHJI YAMAMOTO",
            "srp": 28000.0,
            "price": 11200.0,
            "size": "M / Relaxed",
            "color": "Oatmeal",
            "status": "available",
            "images": json.dumps([
                "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=900&q=85",
                "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=85",
            ]),
            "fit_details": "Slouchy relaxed fit designed for layering.",
            "fabric_details": "Mohair wool blend with horn-style buttons.",
            "condition_details": "Excellent nap and shape. No holes.",
        },
        {
            "archive_id": "ARC-0055",
            "name": "Raw Hem Maxi Skirt",
            "era": "Circa 2000s",
            "brand": "ANN DEMEULEMEESTER",
            "srp": 26000.0,
            "price": 9700.0,
            "size": "S / EU 36",
            "color": "Washed Black",
            "status": "available",
            "images": json.dumps([
                "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=900&q=85",
                "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=900&q=85",
                "https://images.unsplash.com/photo-1605763240000-7e93b172d754?w=900&q=85",
            ]),
            "fit_details": "Long column silhouette with raw asymmetric hem.",
            "fabric_details": "Cotton viscose blend with subtle sheen.",
            "condition_details": "Intentional raw finish. No structural damage.",
        },
        {
            "archive_id": "ARC-0056",
            "name": "Silver Signet Ring",
            "era": "Circa 1980s",
            "brand": "TAXCO VINTAGE",
            "srp": 7200.0,
            "price": 2800.0,
            "size": "US 8",
            "color": "Sterling Silver",
            "status": "available",
            "images": json.dumps([
                "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=85",
                "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=85",
            ]),
            "fit_details": "Classic unisex signet profile.",
            "fabric_details": "Sterling silver with polished face.",
            "condition_details": "Light vintage surface marks, professionally polished.",
        }
    ]

    for p_data in products:
        existing = db.query(models.Product).filter(models.Product.archive_id == p_data["archive_id"]).first()
        if existing:
            for key, value in p_data.items():
                if key == "status" and existing.status in {"reserved", "sold"}:
                    continue
                setattr(existing, key, value)
        else:
            db.add(models.Product(**p_data))
    
    db.commit()
    print(f"Database seeded successfully with {len(products)} products.")

if __name__ == "__main__":
    seed()
