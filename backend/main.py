from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import os

# Absolute imports for production runtime compatibility
try:
    from . import models, database
    from .database import engine, redis_client, get_db
except ImportError:
    import models, database
    from database import engine, redis_client, get_db

# Only create tables if not using migrations (Alembic is recommended for production)
if os.getenv("RENDER"):
    models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Archivé Premium Thrift API")

# Production CORS Policy
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
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
            p_dict['images'] = json.loads(p_dict['images'])
        except:
            pass # Already a list or empty
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

@app.post("/products/{product_id}/checkout")
def checkout_product(product_id: int, delivery_zone: str, db: Session = Depends(get_db)):
    product, locked = get_current_item_status(product_id, db)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    if product.status != "reserved" or not locked:
        raise HTTPException(status_code=400, detail="Item must be reserved before checkout")
        
    # Placeholder for Payment Gateway Integration (PayMongo/Stripe)
    # payment_result = paymongo.create_payment(...)
    
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
