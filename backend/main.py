import warnings
warnings.filterwarnings("ignore")

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import numpy as np
import requests
from datetime import datetime, timedelta
from sklearn.ensemble import GradientBoostingRegressor, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib

app = FastAPI(title="WeatherWise API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = "332c7aeda1d896aa5c4ce26b89c28096"

def generate_training_data():
    np.random.seed(42)
    n_samples = 1000
    
    data = {
        'day_of_year': np.random.randint(1, 366, n_samples),
        'base_temp': np.random.uniform(15, 35, n_samples),
        'humidity': np.random.uniform(30, 95, n_samples),
        'wind_speed': np.random.uniform(0, 30, n_samples),
        'uv_index': np.random.uniform(1, 11, n_samples),
    }
    
    df = pd.DataFrame(data)
    
    df['temp'] = (
        df['base_temp'] + 
        5 * np.sin(2 * np.pi * df['day_of_year'] / 365) +
        df['humidity'] * 0.02 +
        np.random.normal(0, 2, n_samples)
    )
    
    df['rain'] = (
        (df['humidity'] > 70).astype(int) * 0.5 +
        (df['base_temp'] < 25).astype(int) * 0.3 +
        np.random.random(n_samples) * 0.2
    )
    df['rain'] = (df['rain'] > 0.5).astype(int)
    
    return df

train_df = generate_training_data()

feature_cols = ['day_of_year', 'base_temp', 'humidity', 'wind_speed', 'uv_index']
X_train = train_df[feature_cols]
y_temp = train_df['temp']
y_rain = train_df['rain']

temp_model = GradientBoostingRegressor(n_estimators=100, max_depth=4, random_state=42)
temp_model.fit(X_train, y_temp)

rain_model = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
rain_model.fit(X_train, y_rain)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)

class WeatherResponse(BaseModel):
    current: dict
    forecast: List[dict]
    recommendations: List[str]

def get_weather_condition(code: int) -> tuple:
    conditions = {
        200: ("thunderstorm", "Thunderstorm", "⛈️"),
        300: ("rainy", "Light Drizzle", "🌧️"),
        500: ("rainy", "Rain", "🌧️"),
        600: ("snowy", "Snow", "❄️"),
        700: ("cloudy", "Fog", "🌫️"),
        800: ("sunny", "Clear Sky", "☀️"),
        801: ("partly_cloudy", "Few Clouds", "⛅"),
        802: ("cloudy", "Scattered Clouds", "☁️"),
        803: ("cloudy", "Broken Clouds", "☁️"),
        804: ("cloudy", "Overcast", "☁️"),
    }
    for threshold, result in conditions.items():
        if code < threshold:
            return result
    return conditions[800]

def get_aqi(lat: float, lon: float) -> dict:
    try:
        url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={API_KEY}"
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('list'):
                aqi_value = data['list'][0]['main']['aqi']
                components = data['list'][0]['components']
                
                aqi_labels = {
                    1: "Good",
                    2: "Fair",
                    3: "Moderate",
                    4: "Poor",
                    5: "Very Poor"
                }
                
                return {
                    "value": aqi_value,
                    "label": aqi_labels.get(aqi_value, "Unknown"),
                    "pm25": round(components.get('pm2_5', 0), 1),
                    "pm10": round(components.get('pm10', 0), 1),
                    "co": round(components.get('co', 0), 1),
                    "no2": round(components.get('no2', 0), 1),
                }
    except:
        pass
    
    return {
        "value": 0,
        "label": "Unavailable",
        "pm25": 0,
        "pm10": 0,
        "co": 0,
        "no2": 0,
    }

def get_weather_icon(condition: str) -> str:
    icons = {
        "sunny": "sun",
        "partly_cloudy": "cloud-sun",
        "cloudy": "cloud",
        "rainy": "cloud-rain",
        "snowy": "cloud-snow",
        "thunderstorm": "cloud-lightning",
    }
    return icons.get(condition, "cloud")

def generate_recommendations(current: dict, forecast: List[dict]) -> List[str]:
    recommendations = []
    
    if current.get('temp', 0) > 32:
        recommendations.append("🔥 Stay hydrated! High temperature expected")
    elif current.get('temp', 0) < 10:
        recommendations.append("🧥 Bundle up! Cold weather ahead")
    
    if current.get('uv_index', 0) >= 6:
        recommendations.append("☀️ High UV index - wear sunscreen")
    
    avg_rain_prob = sum(f['rain_probability'] for f in forecast[:3]) / 3
    if avg_rain_prob > 50:
        recommendations.append("🌂 Rain likely this week - carry an umbrella!")
    elif avg_rain_prob > 30:
        recommendations.append("🌤️ Partly rainy - might want an umbrella")
    
    if current.get('wind_speed', 0) > 25:
        recommendations.append("💨 Strong winds - secure loose items")
    
    if avg_rain_prob < 20 and current.get('temp', 0) < 30:
        recommendations.append("🌻 Perfect weather for outdoor activities!")
    
    if forecast and forecast[0]['rain_probability'] > 70:
        recommendations.append("⚡ Thunderstorms possible - stay indoors")
    
    if len(recommendations) < 2:
        recommendations.append("🌡️ Normal temperatures - enjoy your day!")
    
    return recommendations[:4]

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/weather")
async def get_weather(city: str):
    if not city:
        raise HTTPException(status_code=400, detail="City name is required")
    
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
        response = requests.get(url, timeout=10)
        data = response.json()
        
        if response.status_code != 200 or 'main' not in data:
            raise HTTPException(status_code=404, detail=f"City '{city}' not found")
        
        weather_code = data['weather'][0]['id']
        condition, description, _ = get_weather_condition(weather_code)
        
        now = datetime.now()
        day_of_year = now.timetuple().tm_yday
        
        lat = data['coord']['lat']
        lon = data['coord']['lon']
        
        aqi_data = get_aqi(lat, lon)
        
        current = {
            "temp": round(data['main']['temp'], 1),
            "feels_like": round(data['main']['feels_like'], 1),
            "humidity": data['main']['humidity'],
            "wind_speed": round(data['wind']['speed'] * 3.6, 1),
            "wind_direction": get_wind_direction(data['wind'].get('deg', 0)),
            "condition": condition,
            "description": description,
            "icon": get_weather_icon(condition),
            "high": round(data['main']['temp_max'], 1),
            "low": round(data['main']['temp_min'], 1),
            "pressure": data['main'].get('pressure', 0),
            "visibility": data.get('visibility', 10000) / 1000,
            "uv_index": estimate_uv_index(now.hour),
            "location": data['name'],
            "country": data['sys'].get('country', ''),
            "sunrise": datetime.fromtimestamp(data['sys']['sunrise']).strftime('%H:%M'),
            "sunset": datetime.fromtimestamp(data['sys']['sunset']).strftime('%H:%M'),
            "aqi": aqi_data,
        }
        
        forecast = []
        for i in range(5):
            future_date = now + timedelta(days=i + 1)
            future_doy = future_date.timetuple().tm_yday
            
            temp_variation = np.random.uniform(-3, 3)
            humidity_variation = np.random.uniform(-15, 15)
            wind_variation = np.random.uniform(-5, 5)
            
            features = pd.DataFrame([[
                future_doy,
                current['temp'] + temp_variation,
                max(30, min(95, current['humidity'] + humidity_variation)),
                max(0, current['wind_speed'] + wind_variation),
                estimate_uv_index(future_date.hour if i == 0 else 12)
            ]], columns=feature_cols)
            
            pred_temp = temp_model.predict(features)[0]
            
            rain_proba = rain_model.predict_proba(features)[0][1]
            
            high_temp = pred_temp + np.random.uniform(2, 5)
            low_temp = pred_temp - np.random.uniform(2, 5)
            
            precip_mm = rain_proba * np.random.uniform(1, 10) if rain_proba > 0.4 else np.random.uniform(0, 1)
            
            rain_percent = int(rain_proba * 100)
            
            forecast.append({
                "day": future_date.strftime("%A"),
                "date": future_date.strftime("%Y-%m-%d"),
                "high": round(high_temp, 1),
                "low": round(low_temp, 1),
                "rain_probability": rain_percent,
                "precipitation_mm": round(precip_mm, 1),
                "condition": "rainy" if rain_percent > 50 else ("cloudy" if rain_percent > 25 else "sunny"),
                "confidence": round(min(0.95, 0.6 + rain_proba * 0.3), 2),
                "humidity": int(max(30, min(95, current['humidity'] + humidity_variation))),
                "wind_speed": round(max(0, current['wind_speed'] + wind_variation), 1),
                "uv_index": estimate_uv_index(12)
            })
        
        recommendations = generate_recommendations(current, forecast)
        
        return WeatherResponse(
            current=current,
            forecast=forecast,
            recommendations=recommendations
        )
        
    except requests.RequestException as e:
        raise HTTPException(status_code=503, detail="Weather service unavailable")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_wind_direction(degrees: float) -> str:
    directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    index = round(degrees / 45) % 8
    return directions[index]

def estimate_uv_index(hour: int) -> float:
    if 6 <= hour <= 18:
        peak = 12
        distance = abs(hour - peak)
        return max(1, 10 - distance * 1.2)
    return 0

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
