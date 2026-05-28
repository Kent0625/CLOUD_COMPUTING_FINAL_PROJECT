# Archive Premium Thrift Demo Runbook

## Goal

Show that the project can be cloned from GitHub, run locally, complete an ecommerce checkout, run ETL, and display reporting analytics.

## 1. Open The Repository

Say:

> This is the submitted GitHub repository for the final cloud computing ecommerce project.

Show:

```bash
https://github.com/Kent0625/CLOUD_COMPUTING_FINAL_PROJECT
```

Clone:

```bash
git clone https://github.com/Kent0625/CLOUD_COMPUTING_FINAL_PROJECT.git
cd CLOUD_COMPUTING_FINAL_PROJECT
```

## 2. Run The Backend

Open terminal 1:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python seed.py
uvicorn main:app --reload
```

Quick backend check:

```text
http://127.0.0.1:8000/products
```

Say:

> FastAPI is serving product, checkout, and analytics routes. In production, the database URLs point to PostgreSQL.

## 3. Run The Frontend

Open terminal 2:

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:3000
```

Say:

> The Next.js storefront fetches the catalog from the backend through the API proxy.

## 4. Demo The Ecommerce Flow

Show:

- Browse products.
- Open a product page.
- Click `Add to Cart`.
- Fill checkout details.
- Choose `Cash on Delivery`.
- Click `Place Order`.

Say:

> Checkout creates transactional order data. This is the source data for reporting.

## 5. Run ETL

Open backend terminal:

```bash
python etl.py
```

Or on VPS:

```cron
0 0 * * * /path/to/thrift_store/backend/run_etl.sh >> /path/to/thrift_store/backend/etl.log 2>&1
```

Say:

> The ETL process copies and transforms transactional data into a separate reporting database.

## 6. Show Dashboard

Open:

```text
http://127.0.0.1:3000/dashboard
```

Explain:

- Total revenue
- Total orders
- Top products
- Customer growth

Say:

> The dashboard reads from reporting tables, not directly from the storefront state.

## 7. Close With Requirement Checklist

Say:

> The demo includes a frontend UI, FastAPI backend, transactional database, separate reporting database, ETL process, cron-ready script, and reporting dashboard. The remaining production step is deploying the same project to the VPS with PostgreSQL and Nginx.

## Safety Checks

Backend tests:

```bash
cd backend
python -m unittest discover -s tests
```

Frontend checks:

```bash
cd frontend
npm run lint
npm run build
```
