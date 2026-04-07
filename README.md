# WeatherWise - ML Weather Prediction App

A beautiful weather prediction app with real-time weather data, 5-day forecast, air quality index, and smart recommendations.

![WeatherWise](https://img.shields.io/badge/Weather-Blue?style=for-the-badge)
![OpenWeatherMap](https://img.shields.io/badge/OpenWeatherMap-API-green?style=for-the-badge)

## Features

- **Real-time Weather**: Current temperature, feels like, humidity, wind, UV index
- **5-Day Forecast**: Weather predictions with confidence levels
- **Air Quality Index (AQI)**: PM2.5, PM10, CO, NO2 levels
- **Rain Probability**: Visual chart showing rain chances
- **Smart Recommendations**: AI-generated tips based on weather
- **Unit Toggle**: Switch between Celsius and Fahrenheit
- **Responsive Design**: Works on desktop and mobile

## How to Use

Simply open `index.html` in any modern browser - **no server required!**

```bash
# Just open the file directly
open index.html
# or
double-click index.html
```

## For Developers

### Tech Stack
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **API**: OpenWeatherMap API
- **Icons**: Lucide Icons

### API Key
The app uses a demo OpenWeatherMap API key. For production, replace it with your own:
1. Get a free API key at [OpenWeatherMap](https://openweathermap.org/api)
2. Open `index.html`
3. Find `API_KEY` variable (around line 520)
4. Replace with your key

### Deployment
Since this is a static HTML file, you can deploy it anywhere:
- GitHub Pages
- Netlify
- Vercel
- Any web server

Just upload `index.html` to your hosting provider.

## Project Structure
```
weatherwise/
├── index.html          # Main app (standalone - works without backend)
├── README.md
├── SPEC.md             # Design specification
├── backend/
│   └── main.py         # Python FastAPI backend (optional - for ML predictions)
└── frontend/           # React version (optional)
    └── ...
```

## Weather Data

The app fetches data from OpenWeatherMap:
- Current weather conditions
- 5-day forecast (3-hour intervals)
- Air quality index

## License

MIT License - feel free to use and modify!
