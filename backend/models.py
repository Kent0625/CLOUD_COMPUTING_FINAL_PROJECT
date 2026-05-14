from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    archive_id = Column(String, unique=True, index=True)
    name = Column(String)
    era = Column(String)
    brand = Column(String)
    srp = Column(Float)
    price = Column(Float)
    size = Column(String)
    color = Column(String)
    status = Column(String, default="available") # available, reserved, sold
    images = Column(Text) # JSON string of image URLs
    fit_details = Column(Text)
    fabric_details = Column(Text)
    condition_details = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    total_amount = Column(Float)
    status = Column(String, default="pending") # pending, paid, delivered
    delivery_zone = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    product = relationship("Product")
