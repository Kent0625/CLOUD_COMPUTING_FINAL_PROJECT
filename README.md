# Archive Premium Thrift - Full-Stack E-Commerce

Archive is a premium thrift-store e-commerce app built with a Next.js storefront, FastAPI backend, PostgreSQL transactional database, separate PostgreSQL reporting database, and a cron-driven ETL pipeline.

## Requirement 

| Requirement | Status | Where |
| --- | --- | --- |
| Frontend UI | Implemented | `frontend/src/app`, `frontend/src/components` |
| Backend API/server using FastAPI | Implemented | `backend/main.py` |
| PostgreSQL main transactional database | Supported for production | `DATABASE_URL` in `backend/.env.example` |
| Separate reporting database | Supported and used by analytics | `REPORTING_DATABASE_URL`, `backend/reporting_database.py` |
| Automated ETL using Linux cron | Implemented | `backend/etl.py`, `backend/run_etl.sh` |
| Reporting dashboard | Implemented | `frontend/src/app/dashboard/page.tsx` |
| Analytics: sales, revenue, top products, customers | Implemented | `/analytics/summary`, `/analytics/sales`, `/analytics/top-products`, `/analytics/customers` |
| VPS deployment documentation | Included | VPS section below |

Local development can fall back to SQLite, but the submitted VPS deployment should use PostgreSQL URLs for both databases.

## Architecture

- **Frontend:** Next.js App Router, React 19, Tailwind CSS v4.
- **Backend:** FastAPI, SQLAlchemy, Gunicorn/Uvicorn.
- **Transactional DB:** PostgreSQL database for users, products, reservations, and orders.
- **Reporting DB:** Separate PostgreSQL database for dimensional/fact reporting tables.
- **ETL:** `backend/etl.py` extracts from the transactional DB, loads reporting dimensions/facts, and updates daily sales summaries.
- **Cron:** `backend/run_etl.sh` loads `.env`, activates the backend virtual environment, and runs the ETL script.

## Local Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python seed.py
uvicorn main:app --reload
```

On Windows, activate the virtual environment with:

```powershell
venv\Scripts\activate
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Run ETL Locally

```bash
cd backend
python etl.py
```

The dashboard reads from the reporting database, so run ETL after creating test orders.

## VPS Deployment Guide

These steps assume Ubuntu on a VPS with Nginx, PostgreSQL, Redis, PM2, and one domain name.

### 1. Server Packages

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3-pip python3-venv nginx postgresql postgresql-contrib redis-server curl git -y
```

### 2. Node.js and PM2

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
source ~/.bashrc
nvm install 20
npm install -g pm2
```

### 3. PostgreSQL Databases

```bash
sudo -u postgres psql
CREATE DATABASE thrift_db;
CREATE DATABASE thrift_reporting_db;
CREATE USER thrift_user WITH ENCRYPTED PASSWORD 'change_this_password';
GRANT ALL PRIVILEGES ON DATABASE thrift_db TO thrift_user;
GRANT ALL PRIVILEGES ON DATABASE thrift_reporting_db TO thrift_user;
\q
```

### 4. Clone and Configure

```bash
git clone https://github.com/Kent0625/thrift_store.git
cd thrift_store/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
nano .env
```

Use production values:

```env
DATABASE_URL=postgresql://thrift_user:change_this_password@localhost:5432/thrift_db
REPORTING_DATABASE_URL=postgresql://thrift_user:change_this_password@localhost:5432/thrift_reporting_db
REDIS_URL=redis://localhost:6379/0
FRONTEND_URL=http://your-domain.com
```

Seed initial product data if needed:

```bash
python seed.py
```

### 5. Start Backend

```bash
pm2 start "gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 127.0.0.1:8000" --name archive-backend
```

### 6. Build and Start Frontend

```bash
cd ../frontend
npm install
cp .env.example .env.local
npm run build
pm2 start npm --name archive-frontend -- start
pm2 save
pm2 startup
```

For a standard VPS/Nginx deployment, keep `NEXT_PUBLIC_API_URL=/api` so browser requests go through the reverse proxy.

### 7. Nginx Reverse Proxy

Create `/etc/nginx/sites-available/archive`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/archive /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. Cron ETL

Make the ETL script executable:

```bash
cd /path/to/thrift_store/backend
chmod +x run_etl.sh
```

Edit cron:

```bash
crontab -e
```

Run ETL every night at midnight:

```cron
0 0 * * * /path/to/thrift_store/backend/run_etl.sh >> /path/to/thrift_store/backend/etl.log 2>&1
```

You can test it manually:

```bash
/path/to/thrift_store/backend/run_etl.sh
```

## Verification

Backend:

```bash
cd backend
python -m unittest discover -s tests
python -m compileall .
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```
