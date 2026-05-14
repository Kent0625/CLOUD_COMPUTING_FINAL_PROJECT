# Archivé Premium Thrift - Full Stack E-Commerce

This project is a full-stack e-commerce application designed for a premium thrift store. It features a modern frontend, a robust backend API, a main transactional database, and a separate reporting database driven by an automated ETL process.

## Architecture

- **Frontend:** Next.js (App Router), React 19, Tailwind CSS v4.
- **Backend:** FastAPI (Python), SQLAlchemy, PostgreSQL (or SQLite for local dev), Redis (optional/mocked for locking).
- **Transactional DB:** Main database for active users, products, and orders.
- **Reporting DB:** A separate database (`reporting_db.sqlite` or PostgreSQL) optimized for analytical queries.
- **ETL Pipeline:** Python script (`etl.py`) scheduled via Linux `cron` to sync and transform data daily.
- **Admin Dashboard:** A frontend dashboard (`/dashboard`) displaying revenue, orders, top products, and customer stats.

## Local Setup

### 1. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
# Set DATABASE_URL and REPORTING_DATABASE_URL in .env if using PostgreSQL
uvicorn main:app --reload
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Run ETL Locally
```bash
cd backend
python etl.py
```

## VPS Deployment Guide (Hostinger/Linux)

### 1. Server Preparation
SSH into your VPS and install dependencies:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3-pip python3-venv nginx postgresql postgresql-contrib curl -y
```

### 2. Install Node.js (via NVM)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
source ~/.bashrc
nvm install 20
npm install -g pm2
```

### 3. Database Setup (PostgreSQL)
Create the main database and the reporting database:
```bash
sudo -u postgres psql
CREATE DATABASE thrift_db;
CREATE DATABASE thrift_reporting_db;
CREATE USER thrift_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE thrift_db TO thrift_user;
GRANT ALL PRIVILEGES ON DATABASE thrift_reporting_db TO thrift_user;
\q
```

### 4. Clone and Configure Project
```bash
git clone https://github.com/Kent0625/thrift_store.git
cd thrift_store

# Backend Setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install psycopg2-binary
```
Create a `.env` file in the `backend` folder:
```
DATABASE_URL=postgresql://thrift_user:your_secure_password@localhost/thrift_db
REPORTING_DATABASE_URL=postgresql://thrift_user:your_secure_password@localhost/thrift_reporting_db
FRONTEND_URL=http://your_domain.com
```

### 5. Running the Backend with PM2 & Gunicorn
```bash
pm2 start "gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 127.0.0.1:8000" --name "thrift-backend"
```

### 6. Building and Running the Frontend
```bash
cd ../frontend
npm install
npm run build
pm2 start npm --name "thrift-frontend" -- start
pm2 save
pm2 startup
```

### 7. Nginx Reverse Proxy Setup
Create an Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/thrift
```
Add the following configuration:
```nginx
server {
    listen 80;
    server_name your_domain.com;

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
Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/thrift /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. Setting up the Automated ETL Cron Job
To automatically transfer and transform data from the main DB to the reporting DB every night at midnight:
```bash
crontab -e
```
Add the following line to the end of the file (adjust the path to match your deployment directory):
```bash
0 0 * * * /path/to/thrift_store/backend/run_etl.sh >> /path/to/thrift_store/backend/etl.log 2>&1
```
Make the script executable:
```bash
chmod +x /path/to/thrift_store/backend/run_etl.sh
```

## Features Complete
- [x] Full-Stack E-Commerce Application (Next.js & FastAPI)
- [x] PostgreSQL Main Transactional Database Integration
- [x] Separate Reporting Database for Analytics
- [x] Automated ETL processes via Linux Cron jobs
- [x] Admin Reporting Dashboard displaying sales, revenue, top products, and customer statistics.
