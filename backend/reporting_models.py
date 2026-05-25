from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date
from sqlalchemy.orm import declarative_base
from datetime import datetime

ReportingBase = declarative_base()

class FactOrder(ReportingBase):
    __tablename__ = "fact_orders"
    id = Column(Integer, primary_key=True, index=True)
    original_order_id = Column(Integer, unique=True, index=True)
    user_id = Column(Integer)
    product_id = Column(Integer)
    total_amount = Column(Float)
    status = Column(String)
    delivery_zone = Column(String)
    created_at = Column(DateTime)

class DimProduct(ReportingBase):
    __tablename__ = "dim_products"
    id = Column(Integer, primary_key=True, index=True)
    original_product_id = Column(Integer, unique=True, index=True)
    name = Column(String)
    brand = Column(String)
    price = Column(Float)
    status = Column(String)
    created_at = Column(DateTime)

class DimUser(ReportingBase):
    __tablename__ = "dim_users"
    id = Column(Integer, primary_key=True, index=True)
    original_user_id = Column(Integer, unique=True, index=True)
    email = Column(String)
    created_at = Column(DateTime)

class DailySalesSummary(ReportingBase):
    __tablename__ = "daily_sales_summary"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, unique=True, index=True)
    total_orders = Column(Integer, default=0)
    total_revenue = Column(Float, default=0.0)
