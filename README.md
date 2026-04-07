# WeatherWise - ML Weather Prediction App

A modern weather prediction application with ML-powered 5-day forecasts, featuring a beautiful glass-morphism UI that adapts to weather conditions.

## Features

- **Current Weather**: Real-time weather data with temperature, humidity, wind, UV index
- **ML-Powered 5-Day Forecast**: Predicts temperature ranges and rain probability using machine learning
- **Rain Probability Chart**: Visual representation of precipitation chances
- **Smart Recommendations**: AI-generated tips based on weather conditions
- **Unit Toggle**: Switch between Celsius and Fahrenheit
- **Recent Searches**: Quick access to previously searched cities

## Tech Stack

### Backend
- FastAPI (Python)
- scikit-learn (ML models)
- OpenWeatherMap API

### Frontend
- React 18
- Vite
- Tailwind CSS
- Lucide React Icons

## Setup

### 1. Install Backend Dependencies

```bash
cd backend
pip install fastapi uvicorn pandas numpy scikit-learn requests
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
python main.py
```
Backend will start on http://localhost:8000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will start on http://localhost:5173

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/weather?city={city_name}` - Get weather data with ML forecast

## Example Response

```json
{
  "current": {
    "temp": 25,
    "humidity": 65,
    "wind_speed": 12,
    "condition": "partly_cloudy",
    ...
  },
  "forecast": [
    {
      "day": "Monday",
      "high": 28,
      "low": 22,
      "rain_probability": 45,
      "confidence": 0.78,
      ...
    },
    ...
  ],
  "recommendations": [
    "Great day for outdoor activities!",
    "Don't forget your umbrella!"
  ]
}
```

## ML Models

### Temperature Prediction
- Algorithm: Gradient Boosting Regressor
- Features: day of year, base temp, humidity, wind speed, UV index

### Rain Prediction
- Algorithm: Random Forest Classifier
- Features: temperature, humidity, wind speed

## Weather Icons

The app supports the following weather conditions:
- ☀️ Sunny
- ⛅ Partly Cloudy
- ☁️ Cloudy
- 🌧️ Rainy
- ❄️ Snowy
- ⛈️ Thunderstorm
