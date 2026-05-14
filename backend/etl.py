import os
from sqlalchemy.orm import Session
from database import SessionLocal
from reporting_database import ReportingSessionLocal, reporting_engine
from models import Order, Product, User
from reporting_models import ReportingBase, FactOrder, DimProduct, DimUser, DailySalesSummary
from datetime import date
from sqlalchemy import func

def run_etl():
    print("Starting ETL process...")
    
    # Initialize Reporting DB tables
    ReportingBase.metadata.create_all(bind=reporting_engine)
    
    main_db: Session = SessionLocal()
    rep_db: Session = ReportingSessionLocal()
    
    try:
        # Extract & Load DimUser
        users = main_db.query(User).all()
        for u in users:
            existing = rep_db.query(DimUser).filter(DimUser.original_user_id == u.id).first()
            if not existing:
                rep_db.add(DimUser(original_user_id=u.id, email=u.email, created_at=u.created_at))
        
        # Extract & Load DimProduct
        products = main_db.query(Product).all()
        for p in products:
            existing = rep_db.query(DimProduct).filter(DimProduct.original_product_id == p.id).first()
            if not existing:
                rep_db.add(DimProduct(original_product_id=p.id, name=p.name, brand=p.brand, price=p.price, status=p.status, created_at=p.created_at))
            else:
                existing.status = p.status
        
        # Extract & Load FactOrder
        orders = main_db.query(Order).all()
        for o in orders:
            existing = rep_db.query(FactOrder).filter(FactOrder.original_order_id == o.id).first()
            if not existing:
                rep_db.add(FactOrder(
                    original_order_id=o.id,
                    user_id=o.user_id,
                    product_id=o.product_id,
                    total_amount=o.total_amount,
                    status=o.status,
                    delivery_zone=o.delivery_zone,
                    created_at=o.created_at
                ))
            else:
                existing.status = o.status
        
        rep_db.commit()
        
        # Transform: Update DailySalesSummary
        sales_data = rep_db.query(
            func.date(FactOrder.created_at).label('date'),
            func.count(FactOrder.id).label('total_orders'),
            func.sum(FactOrder.total_amount).label('total_revenue')
        ).filter(FactOrder.status == 'paid').group_by(func.date(FactOrder.created_at)).all()
        
        for record in sales_data:
            # record.date could be a string if SQLite or Date object if Postgres
            # So parse to date if it's string
            sale_date = record.date
            if isinstance(sale_date, str):
                try:
                    from datetime import datetime
                    sale_date = datetime.strptime(sale_date, "%Y-%m-%d").date()
                except ValueError:
                    pass

            existing_summary = rep_db.query(DailySalesSummary).filter(DailySalesSummary.date == sale_date).first()
            if existing_summary:
                existing_summary.total_orders = record.total_orders
                existing_summary.total_revenue = record.total_revenue
            else:
                rep_db.add(DailySalesSummary(
                    date=sale_date,
                    total_orders=record.total_orders,
                    total_revenue=record.total_revenue
                ))
        
        rep_db.commit()
        print("ETL process completed successfully.")

    except Exception as e:
        rep_db.rollback()
        print(f"ETL process failed: {e}")
        raise
    finally:
        main_db.close()
        rep_db.close()

if __name__ == "__main__":
    run_etl()
