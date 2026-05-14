from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Absolute imports for production runtime compatibility
try:
    from . import models, database, reporting_models, reporting_database
    from .database import engine, redis_client, get_db
    from .reporting_database import get_reporting_db
except ImportError:
    import models, database, reporting_models, reporting_database
    from database import engine, redis_client, get_db
    from reporting_database import get_reporting_db

# Create tables on startup (Safe/Idempotent)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Archivé Premium Thrift API")

# Production CORS Policy
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
origins = [FRONTEND_URL]

# Allow Render preview URLs
if os.getenv("RENDER"):
    origins.append("https://*.onrender.com")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Dependency ──────────────────────────────────────────────────────

def get_current_item_status(item_id: int, db: Session):
    lock_key = f"lock:product:{item_id}"
    lock_exists = redis_client.exists(lock_key)
    product = db.query(models.Product).filter(models.Product.id == item_id).first()
    
    if not product:
        return None, None
        
    # Lazy Evaluation
    if product.status == "reserved" and not lock_exists:
        product.status = "available"
        db.commit()
        db.refresh(product)
        
    return product, lock_exists

# ── Routes ──────────────────────────────────────────────────────────

@app.get("/products", response_model=List[dict])
def list_products(db: Session = Depends(get_db)):
    products = db.query(models.Product).all()
    result = []
    for p in products:
        updated_p, _ = get_current_item_status(p.id, db)
        p_dict = updated_p.__dict__.copy()
        p_dict.pop('_sa_instance_state', None)
        try:
            if isinstance(p_dict['images'], str):
                p_dict['images'] = json.loads(p_dict['images'])
        except:
            pass 
        result.append(p_dict)
    return result

@app.get("/products/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product, locked = get_current_item_status(product_id, db)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    res = product.__dict__.copy()
    res.pop('_sa_instance_state', None)
    try:
        if isinstance(res['images'], str):
            res['images'] = json.loads(res['images'])
    except:
        pass
    res['is_locked'] = bool(locked)
    if locked:
        res['lock_ttl'] = redis_client.ttl(f"lock:product:{product_id}")
    return res

@app.post("/products/{product_id}/reserve")
def reserve_product(product_id: int, db: Session = Depends(get_db)):
    product, locked = get_current_item_status(product_id, db)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product.status != "available":
        raise HTTPException(status_code=400, detail="Item is already reserved or sold")
        
    redis_client.set(f"lock:product:{product_id}", "reserved", ex=600)
    
    product.status = "reserved"
    db.commit()
    return {"message": "Item reserved for 10 minutes", "ttl": 600}

@app.post("/products/{product_id}/unreserve")
def unreserve_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # Delete the Redis lock
    redis_client.delete(f"lock:product:{product_id}")
    
    # Set status back to available
    if product.status == "reserved":
        product.status = "available"
        db.commit()
        
    return {"message": "Item released"}

@app.post("/products/{product_id}/checkout")
def checkout_product(product_id: int, delivery_zone: str, db: Session = Depends(get_db)):
    product, locked = get_current_item_status(product_id, db)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    if product.status != "reserved" or not locked:
        raise HTTPException(status_code=400, detail="Item must be reserved before checkout")
        
    product.status = "sold"
    redis_client.delete(f"lock:product:{product_id}")
    
    new_order = models.Order(
        product_id=product_id,
        total_amount=product.price,
        status="paid",
        delivery_zone=delivery_zone
    )
    db.add(new_order)
    db.commit()
    
    return {"message": "Purchase successful", "order_id": new_order.id}

# ── Analytics Routes ────────────────────────────────────────────────

@app.get("/analytics/summary")
def get_analytics_summary(rep_db: Session = Depends(get_reporting_db)):
    from sqlalchemy import func
    total_revenue = rep_db.query(func.sum(reporting_models.DailySalesSummary.total_revenue)).scalar() or 0.0
    total_orders = rep_db.query(func.sum(reporting_models.DailySalesSummary.total_orders)).scalar() or 0
    total_customers = rep_db.query(func.count(reporting_models.DimUser.id)).scalar() or 0
    
    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "total_customers": total_customers
    }

@app.get("/analytics/sales")
def get_sales_analytics(rep_db: Session = Depends(get_reporting_db)):
    sales = rep_db.query(reporting_models.DailySalesSummary).order_by(reporting_models.DailySalesSummary.date).all()
    return [{"date": s.date, "total_orders": s.total_orders, "total_revenue": s.total_revenue} for s in sales]

@app.get("/analytics/top-products")
def get_top_products(rep_db: Session = Depends(get_reporting_db)):
    from sqlalchemy import func
    top_products = rep_db.query(
        reporting_models.DimProduct.name,
        func.count(reporting_models.FactOrder.id).label('sold_count')
    ).join(
        reporting_models.FactOrder,
        reporting_models.DimProduct.original_product_id == reporting_models.FactOrder.product_id
    ).filter(
        reporting_models.FactOrder.status == 'paid'
    ).group_by(
        reporting_models.DimProduct.id
    ).order_by(
        func.count(reporting_models.FactOrder.id).desc()
    ).limit(5).all()
    
    return [{"name": p.name, "sold_count": p.sold_count} for p in top_products]

