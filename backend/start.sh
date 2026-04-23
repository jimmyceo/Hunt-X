#!/bin/bash

# Hunt-X Backend Start Script

echo "Starting Hunt-X Backend..."

# Run database migrations/initialization
echo "Initializing database..."
python3 -c "
import sys
sys.path.insert(0, '.')
from database import init_db
init_db()
print('Database initialized')
"

# Initialize subscription plans
echo "Setting up subscription plans..."
python3 -c "
import sys
sys.path.insert(0, '.')
from database import SessionLocal
from services.subscription_service import SubscriptionService

db = SessionLocal()
try:
    service = SubscriptionService(db)
    service.initialize_plans()
    print('Subscription plans initialized')
except Exception as e:
    print(f'Warning: {e}')
finally:
    db.close()
"

# Start the server
echo "Starting FastAPI server..."
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
