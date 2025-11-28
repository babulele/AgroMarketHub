import redis.asyncio as redis
import os
from dotenv import load_dotenv

load_dotenv()

redis_client: redis.Redis = None

async def get_redis_client():
    global redis_client
    if redis_client:
        return redis_client
    
    host = os.getenv("REDIS_HOST", "localhost")
    port = int(os.getenv("REDIS_PORT", 6379))
    password = os.getenv("REDIS_PASSWORD")
    
    redis_client = redis.Redis(
        host=host,
        port=port,
        password=password if password else None,
        decode_responses=True
    )
    print("Connected to Redis")
    return redis_client

async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None
        print("Disconnected from Redis")

