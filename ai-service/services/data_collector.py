import requests
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from utils.database import get_database
import pandas as pd

COUNTY_COORDINATES = {
    "Nairobi": {"lat": -1.286389, "lon": 36.817223},
    "Kiambu": {"lat": -1.1, "lon": 36.8356},
    "Nakuru": {"lat": -0.3031, "lon": 36.0800},
    "Uasin Gishu": {"lat": 0.5143, "lon": 35.2698},
    "Meru": {"lat": 0.0476, "lon": 37.6559},
    "Machakos": {"lat": -1.5167, "lon": 37.2667},
    "Mombasa": {"lat": -4.0435, "lon": 39.6682},
}


class DataCollector:
    def __init__(self):
        self.weather_api_key = os.getenv("WEATHER_API_KEY")
        self.weather_api_url = "https://api.openweathermap.org/data/2.5"
    
    async def get_weather_data(self, lat: float, lon: float, days: int = 5) -> List[Dict]:
        """Fetch weather data from OpenWeatherMap API"""
        try:
            # For historical data, you'd need a different endpoint
            # This is a simplified version
            url = f"{self.weather_api_url}/forecast"
            params = {
                "lat": lat,
                "lon": lon,
                "appid": self.weather_api_key,
                "units": "metric"
            }
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching weather data: {e}")
            return []
    
    async def get_weather_summary(self, county: Optional[str] = None) -> Dict:
        """Return simple weather summary for a county (defaults to Nairobi)"""
        coordinates = COUNTY_COORDINATES.get(county or "", COUNTY_COORDINATES["Nairobi"])
        weather_data = await self.get_weather_data(coordinates["lat"], coordinates["lon"])
        if not weather_data or "list" not in weather_data:
            return {"avg_temp": 24, "humidity": 65, "rain_chance": 0.3}

        temps = []
        humidities = []
        rain_probabilities = []

        for entry in weather_data.get("list", []):
            main = entry.get("main", {})
            temps.append(main.get("temp"))
            humidities.append(main.get("humidity"))
            weather = entry.get("weather", [{}])[0]
            rain_probabilities.append(1.0 if weather.get("main") in ["Rain", "Thunderstorm"] else 0.0)

        valid_temps = [t for t in temps if t is not None]
        valid_humidity = [h for h in humidities if h is not None]

        return {
            "avg_temp": sum(valid_temps) / len(valid_temps) if valid_temps else 24,
            "humidity": sum(valid_humidity) / len(valid_humidity) if valid_humidity else 65,
            "rain_chance": sum(rain_probabilities) / len(rain_probabilities) if rain_probabilities else 0.3,
        }

    async def get_sales_data(self, days: int = 120) -> pd.DataFrame:
        """Fetch historical sales data joined with product metadata"""
        db = get_database()
        cutoff_date = datetime.now() - timedelta(days=days)
        
        pipeline = [
            {
                "$match": {
                    "payment.status": "completed",
                    "createdAt": {"$gte": cutoff_date}
                }
            },
            {
                "$unwind": "$items"
            },
            {
                "$lookup": {
                    "from": "products",
                    "localField": "items.product",
                    "foreignField": "_id",
                    "as": "productInfo"
                }
            },
            {"$unwind": "$productInfo"},
            {
                "$group": {
                    "_id": {
                        "date": {"$dateToString": {"format": "%Y-%m-%d", "date": "$createdAt"}},
                        "product": "$items.product",
                        "productName": "$productInfo.name",
                        "category": "$productInfo.category",
                        "county": "$productInfo.location.county",
                    },
                    "quantity": {"$sum": "$items.quantity"},
                    "revenue": {"$sum": {"$multiply": ["$items.quantity", "$items.price"]}},
                    "avgPrice": {"$avg": "$items.price"},
                }
            }
        ]
        
        orders = await db.orders.aggregate(pipeline).to_list(length=None)
        records = []
        for order in orders:
            key = order["_id"]
            records.append({
                "date": key.get("date"),
                "product_id": str(key.get("product")),
                "product_name": key.get("productName"),
                "category": key.get("category"),
                "county": key.get("county"),
                "quantity": order.get("quantity", 0),
                "revenue": order.get("revenue", 0),
                "avg_price": order.get("avgPrice", 0),
            })
        return pd.DataFrame(records)
    
    async def get_buyer_behavior_data(self, days: int = 30) -> pd.DataFrame:
        """Fetch buyer behavior data (views, cart additions)"""
        db = get_database()
        cutoff_date = datetime.now() - timedelta(days=days)
        
        products = await db.products.find({
            "updatedAt": {"$gte": cutoff_date}
        }).to_list(length=None)
        
        data = []
        for product in products:
            data.append({
                "product_id": str(product["_id"]),
                "views": product.get("views", 0),
                "cart_additions": product.get("cartAdditions", 0),
                "date": product.get("updatedAt")
            })
        
        return pd.DataFrame(data)
    
    async def get_price_history(self, product_id: str = None, days: int = 120) -> pd.DataFrame:
        """Fetch historical price data"""
        db = get_database()
        cutoff_date = datetime.now() - timedelta(days=days)
        
        query = {"updatedAt": {"$gte": cutoff_date}}
        if product_id:
            query["_id"] = product_id
        
        # This would need a price history collection
        # For now, using product updates as proxy
        products = await db.products.find(query).to_list(length=None)
        data = []
        for product in products:
            data.append({
                "product_id": str(product["_id"]),
                "price": product.get("price", 0),
                "date": product.get("updatedAt")
            })
        
        return pd.DataFrame(data)

    async def get_regional_sales(self, days: int = 60) -> pd.DataFrame:
        """Aggregate orders by county for heatmap analysis"""
        db = get_database()
        cutoff_date = datetime.now() - timedelta(days=days)
        pipeline = [
            {
                "$match": {
                    "payment.status": "completed",
                    "createdAt": {"$gte": cutoff_date}
                }
            },
            {
                "$group": {
                    "_id": "$delivery.county",
                    "total_orders": {"$sum": 1},
                    "total_revenue": {"$sum": "$totalAmount"},
                    "avg_delivery_time": {"$avg": {"$subtract": ["$updatedAt", "$createdAt"]}}
                }
            }
        ]

        regions = await db.orders.aggregate(pipeline).to_list(length=None)
        records = []
        for region in regions:
            if not region["_id"]:
                continue
            records.append({
                "county": region["_id"],
                "total_orders": region.get("total_orders", 0),
                "total_revenue": region.get("total_revenue", 0),
                "avg_delivery_time": region.get("avg_delivery_time", 0),
            })
        return pd.DataFrame(records)

