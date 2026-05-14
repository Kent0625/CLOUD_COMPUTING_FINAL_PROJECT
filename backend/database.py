from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Use SQLite for local testing by default
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./archive_db.sqlite")
REDIS_URL = os.getenv("REDIS_URL", None)

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# In-memory Redis Mock for local testing
class RedisMock:
    def __init__(self):
        self.data = {}
        self.ttls = {}
    def set(self, key, value, ex=None):
        self.data[key] = value
        if ex: self.ttls[key] = ex
    def get(self, key):
        return self.data.get(key)
    def exists(self, key):
        return key in self.data
    def delete(self, key):
        self.data.pop(key, None)
    def ttl(self, key):
        return self.ttls.get(key, 600)

if REDIS_URL:
    from redis import Redis
    redis_client = Redis.from_url(REDIS_URL, decode_responses=True)
else:
    print("REDIS_URL not found. Using in-memory Redis mock.")
    redis_client = RedisMock()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
