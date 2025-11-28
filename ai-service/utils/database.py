from motor.motor_asyncio import AsyncIOMotorClient
import os
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

client: AsyncIOMotorClient = None
database = None

def get_database_name_from_uri(uri: str) -> str:
    """Extract database name from MongoDB URI"""
    try:
        # Parse the URI
        parsed = urlparse(uri)
        # Get the database name from the path (remove leading slash)
        db_name = parsed.path.lstrip('/')
        # Remove query parameters if present
        if '?' in db_name:
            db_name = db_name.split('?')[0]
        # If no database name in URI, use default or environment variable
        if not db_name:
            db_name = os.getenv("MONGODB_DB_NAME", "agromarkethub")
        return db_name
    except Exception as e:
        # Fallback to environment variable or default
        return os.getenv("MONGODB_DB_NAME", "agromarkethub")

async def connect_db():
    global client, database
    mongodb_uri = os.getenv("MONGODB_URI")
    if not mongodb_uri:
        raise ValueError("MONGODB_URI not found in environment variables")
    
    # Extract database name from URI or use environment variable
    db_name = get_database_name_from_uri(mongodb_uri)
    
    client = AsyncIOMotorClient(mongodb_uri)
    database = client[db_name]
    print(f"Connected to MongoDB database: {db_name}")

async def close_db():
    global client
    if client:
        client.close()
        print("Disconnected from MongoDB")

def get_database():
    return database

