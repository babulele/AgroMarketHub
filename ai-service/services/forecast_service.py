import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from bson import ObjectId
from services.data_collector import DataCollector
from utils.database import get_database

try:
    from prophet import Prophet
    PROPHET_AVAILABLE = True
except Exception:
    PROPHET_AVAILABLE = False

try:
    import tensorflow as tf
    from tensorflow.keras import layers, models
    TENSORFLOW_AVAILABLE = True
except Exception:
    TENSORFLOW_AVAILABLE = False

from sklearn.ensemble import RandomForestRegressor
from sklearn.cluster import KMeans

FORECAST_HORIZON = {
    "weekly": 7,
    "monthly": 30,
    "seasonal": 90,
}


class ForecastService:
    def __init__(self):
        self.data_collector = DataCollector()

    async def generate_demand_forecast(
        self,
        forecast_type: str = "monthly",
        scope: str = "nationwide",
        region: Optional[Dict] = None
    ) -> List[Dict]:
        horizon = FORECAST_HORIZON.get(forecast_type, 30)
        sales_df = await self.data_collector.get_sales_data(days=180)
        weather_summary = await self.data_collector.get_weather_summary(region.get("county") if region else None)

        if sales_df.empty or len(sales_df) < 10:
            return self._fallback_forecast(forecast_type, region, weather_summary)

        ts = self._prepare_time_series(sales_df)
        lstm_values = self._forecast_with_lstm(ts, horizon)
        prophet_values = self._forecast_with_prophet(ts, horizon, "D")
        combined = self._combine_forecasts(ts, lstm_values, prophet_values, horizon)

        return self._build_crop_forecasts(
            sales_df,
            combined,
            weather_summary,
            region
        )

    async def generate_price_recommendations(
        self,
        product_id: str,
        historical_days: int = 60
    ) -> Dict:
        history = await self.data_collector.get_price_history(product_id=product_id, days=historical_days)
        if history.empty or len(history) < 5:
            avg_price = history["price"].mean() if not history.empty else None
            return {
                "recommended_price": round(avg_price, 2) if avg_price else None,
                "confidence": 45 if avg_price else 0,
                "current_avg": round(avg_price, 2) if avg_price else None
            }

        history["date"] = pd.to_datetime(history["date"])
        history = history.sort_values("date")
        history["dayofweek"] = history["date"].dt.dayofweek
        history["month"] = history["date"].dt.month
        history["trend"] = range(len(history))
        history["rolling_mean"] = history["price"].rolling(window=5, min_periods=1).mean()

        features = history[["dayofweek", "month", "trend", "rolling_mean"]].values
        target = history["price"].values

        model = RandomForestRegressor(n_estimators=150, random_state=42)
        model.fit(features, target)

        future_features = np.array([[history.iloc[-1]["dayofweek"], history.iloc[-1]["month"], len(history) + 7, history.iloc[-1]["rolling_mean"]]])
        prediction = model.predict(future_features)[0]

        return {
            "recommended_price": round(float(prediction), 2),
            "confidence": 85,
            "current_avg": round(float(history["price"].iloc[-5:].mean()), 2)
        }

    async def generate_regional_heatmap(self) -> Dict:
        regional_df = await self.data_collector.get_regional_sales()
        if regional_df.empty:
            return {}

        features = regional_df[["total_orders", "total_revenue"]].values
        n_clusters = min(3, len(regional_df))
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init="auto")
        clusters = kmeans.fit_predict(features)

        heatmap = {}
        for idx, row in regional_df.iterrows():
            heatmap[row["county"]] = {
                "demand_score": int(row["total_orders"]),
                "revenue": float(row["total_revenue"]),
                "cluster": int(clusters[idx]),
            }
        return heatmap

    async def get_farmer_insights(self, farmer_id: str) -> Dict:
        db = get_database()
        if db is None:
            raise ValueError("Database connection is not initialized")

        try:
            farmer_object_id = ObjectId(farmer_id)
        except Exception as exc:
            raise ValueError("Invalid farmer ID") from exc

        products = await db.products.find({"farmer": farmer_object_id}).to_list(length=None)
        product_ids = [p["_id"] for p in products]

        orders = []
        if product_ids:
            orders = await db.orders.find({"items.product": {"$in": product_ids}}).to_list(length=None)

        total_sales = sum(order.get("totalAmount", 0) for order in orders)
        total_orders = len(orders)

        crop_categories = list({p.get("category") for p in products if p.get("category")})
        forecasts = await self.generate_demand_forecast()
        relevant_forecasts = [forecast for forecast in forecasts if forecast["crop"] in crop_categories]

        return {
            "total_sales": total_sales,
            "total_orders": total_orders,
            "active_products": len(products),
            "demand_forecasts": relevant_forecasts or forecasts[:5],
            "recommendations": [
                "Increase supply for crops with demand scores above 80%",
                "Use AI price guidance before dispatching produce",
                "Diversify inventory to counties with growing demand clusters",
            ],
        }

    # Helper methods

    def _prepare_time_series(self, sales_df: pd.DataFrame) -> pd.DataFrame:
        ts = (
            sales_df.groupby("date")["quantity"]
            .sum()
            .reset_index()
            .sort_values("date")
        )
        ts["ds"] = pd.to_datetime(ts["date"])
        ts["y"] = ts["quantity"].astype(float)
        return ts[["ds", "y"]]

    def _forecast_with_lstm(self, ts: pd.DataFrame, horizon: int) -> Optional[List[float]]:
        if not TENSORFLOW_AVAILABLE or len(ts) < 30:
            return None

        values = ts["y"].values.astype(float)
        window = min(14, len(values) // 2)
        if window < 5:
            return None

        scaled = values / (np.max(values) or 1)
        X, y = [], []
        for i in range(len(scaled) - window):
            X.append(scaled[i : i + window])
            y.append(scaled[i + window])

        X = np.array(X).reshape(-1, window, 1)
        y = np.array(y)

        model = models.Sequential([
            layers.Input(shape=(window, 1)),
            layers.LSTM(32, return_sequences=False),
            layers.Dense(16, activation="relu"),
            layers.Dense(1),
        ])
        model.compile(optimizer="adam", loss="mse")
        model.fit(X, y, epochs=40, batch_size=8, verbose=0)

        predictions = []
        last_seq = scaled[-window:].tolist()
        for _ in range(horizon):
            arr = np.array(last_seq[-window:]).reshape(1, window, 1)
            next_val = model.predict(arr, verbose=0)[0][0]
            predictions.append(float(next_val))
            last_seq.append(next_val)

        max_value = np.max(values) or 1
        return [max(0, pred * max_value) for pred in predictions]

    def _forecast_with_prophet(self, ts: pd.DataFrame, horizon: int, freq: str) -> Optional[List[float]]:
        if not PROPHET_AVAILABLE or len(ts) < 10:
            return None

        model = Prophet(seasonality_mode="multiplicative", yearly_seasonality=False)
        model.fit(ts)
        future = model.make_future_dataframe(periods=horizon, freq=freq)
        forecast = model.predict(future)
        return forecast.tail(horizon)["yhat"].tolist()

    def _combine_forecasts(
        self,
        ts: pd.DataFrame,
        lstm_values: Optional[List[float]],
        prophet_values: Optional[List[float]],
        horizon: int,
    ) -> List[float]:
        if lstm_values and prophet_values:
            return [(l + p) / 2 for l, p in zip(lstm_values, prophet_values)]
        if lstm_values:
            return lstm_values
        if prophet_values:
            return prophet_values

        baseline = np.mean(ts["y"].values[-7:]) if len(ts) >= 7 else np.mean(ts["y"].values)
        return [baseline for _ in range(horizon)]

    def _build_crop_forecasts(
        self,
        sales_df: pd.DataFrame,
        combined_series: List[float],
        weather_summary: Dict,
        region: Optional[Dict],
    ) -> List[Dict]:
        total_quantity = sales_df["quantity"].sum() or 1
        category_totals = sales_df.groupby("category")["quantity"].sum().sort_values(ascending=False)
        top_categories = category_totals.head(7)

        weather_factor = 1.0
        if weather_summary["avg_temp"] > 28:
            weather_factor -= 0.05
        if weather_summary["rain_chance"] > 0.6:
            weather_factor += 0.08

        forecasts = []
        for category, qty in top_categories.items():
            share = qty / total_quantity
            base_demand = np.mean(combined_series) * share * weather_factor
            demand_score = min(100, max(30, base_demand))
            avg_price = sales_df[sales_df["category"] == category]["avg_price"].mean() or 0
            confidence = 75
            if not (TENSORFLOW_AVAILABLE and PROPHET_AVAILABLE):
                confidence -= 10
            if len(sales_df[sales_df["category"] == category]) < 5:
                confidence -= 10

            forecasts.append({
                "crop": category or "Mixed Produce",
                "demand": round(demand_score, 2),
                "confidence": max(50, confidence),
                "priceRecommendation": round(avg_price * 1.05, 2),
                "region": region.get("county") if region else "Nationwide",
                "weather": weather_summary,
            })

        return forecasts

    def _fallback_forecast(self, forecast_type: str, region: Optional[Dict], weather_summary: Dict) -> List[Dict]:
        seasonal_factor = 1.2 if forecast_type == "seasonal" else 1.0
        crops = ["Maize", "Beans", "Tomatoes", "Onions", "Potatoes", "Cabbage", "Carrots"]
        forecasts = []
        for crop in crops:
            base = 70 + np.random.uniform(-10, 15)
            weather_adjusted = base * seasonal_factor
            forecasts.append({
                "crop": crop,
                "demand": round(weather_adjusted, 2),
                "confidence": 55,
                "priceRecommendation": round(weather_adjusted * 0.8, 2),
                "region": region.get("county") if region else "Nationwide",
                "weather": weather_summary,
            })
        return forecasts

