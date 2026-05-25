import importlib
import os
import sys
import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient


BACKEND_DIR = Path(__file__).resolve().parents[1]


class ReportingApiTests(unittest.TestCase):
    def setUp(self):
        self.tmpdir = tempfile.TemporaryDirectory()
        tmp_path = Path(self.tmpdir.name)
        os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path / 'main.sqlite'}"
        os.environ["REPORTING_DATABASE_URL"] = f"sqlite:///{tmp_path / 'reporting.sqlite'}"
        os.environ.pop("REDIS_URL", None)
        os.environ["FRONTEND_URL"] = "http://localhost:3000"

        if str(BACKEND_DIR) not in sys.path:
            sys.path.insert(0, str(BACKEND_DIR))

        for module_name in [
            "main",
            "database",
            "models",
            "reporting_database",
            "reporting_models",
            "etl",
        ]:
            sys.modules.pop(module_name, None)

    def tearDown(self):
        database = sys.modules.get("database")
        if database is not None:
            database.engine.dispose()

        reporting_database = sys.modules.get("reporting_database")
        if reporting_database is not None:
            reporting_database.reporting_engine.dispose()

        self.tmpdir.cleanup()

    def test_summary_returns_zeroes_before_first_etl_run(self):
        app_module = importlib.import_module("main")
        client = TestClient(app_module.app, raise_server_exceptions=False)

        response = client.get("/analytics/summary")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "total_revenue": 0.0,
                "total_orders": 0,
                "total_customers": 0,
            },
        )

    def test_customer_analytics_reports_new_customers_after_etl(self):
        app_module = importlib.import_module("main")
        models = importlib.import_module("models")
        database = importlib.import_module("database")
        etl = importlib.import_module("etl")

        db = database.SessionLocal()
        try:
            customer = models.User(email="buyer@example.com", hashed_password="test")
            product = models.Product(
                archive_id="ARC-TEST",
                name="Test Coat",
                era="Circa 1990s",
                brand="Archive Test",
                srp=2000.0,
                price=1000.0,
                size="M",
                color="Black",
                status="sold",
                images="[]",
            )
            db.add_all([customer, product])
            db.commit()
            db.refresh(customer)
            db.refresh(product)

            db.add(
                models.Order(
                    user_id=customer.id,
                    product_id=product.id,
                    total_amount=product.price,
                    status="paid",
                    delivery_zone="Zone 1",
                )
            )
            db.commit()
        finally:
            db.close()

        etl.run_etl()
        client = TestClient(app_module.app, raise_server_exceptions=False)

        response = client.get("/analytics/customers")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]["new_customers"], 1)

    def test_checkout_customer_details_flow_into_reporting_customer_stats(self):
        app_module = importlib.import_module("main")
        models = importlib.import_module("models")
        database = importlib.import_module("database")
        etl = importlib.import_module("etl")
        client = TestClient(app_module.app, raise_server_exceptions=False)

        db = database.SessionLocal()
        try:
            product = models.Product(
                archive_id="ARC-CHECKOUT",
                name="Checkout Coat",
                era="Circa 1990s",
                brand="Archive Test",
                srp=2000.0,
                price=1000.0,
                size="M",
                color="Black",
                status="available",
                images="[]",
            )
            db.add(product)
            db.commit()
            db.refresh(product)
            product_id = product.id
        finally:
            db.close()

        reserve_response = client.post(f"/products/{product_id}/reserve")
        self.assertEqual(reserve_response.status_code, 200)

        checkout_response = client.post(
            f"/products/{product_id}/checkout",
            params={
                "delivery_zone": "Zone 1",
                "customer_name": "Ana Buyer",
                "customer_phone": "09171234567",
            },
        )
        self.assertEqual(checkout_response.status_code, 200)

        etl.run_etl()

        summary_response = client.get("/analytics/summary")
        customer_response = client.get("/analytics/customers")

        self.assertEqual(summary_response.json()["total_customers"], 1)
        self.assertEqual(customer_response.json()[0]["new_customers"], 1)
