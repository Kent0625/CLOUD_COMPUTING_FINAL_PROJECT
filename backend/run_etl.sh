#!/bin/bash
# run_etl.sh - Script to run the ETL process for the reporting database.
# To be executed via cron job on the VPS.

# Navigate to the backend directory
cd "$(dirname "$0")"

# If using a virtual environment, activate it:
# source venv/bin/activate

# Load environment variables if needed
# export $(grep -v '^#' .env | xargs)

# Run the ETL script
python3 etl.py
