#!/bin/bash
# run_etl.sh - Script to run the ETL process for the reporting database.
# To be executed via cron job on the VPS.

set -euo pipefail

cd "$(dirname "$0")"

if [ -f "venv/bin/activate" ]; then
  source "venv/bin/activate"
fi

if [ -f ".env" ]; then
  set -a
  # shellcheck disable=SC1091
  source ".env"
  set +a
fi

python3 etl.py
