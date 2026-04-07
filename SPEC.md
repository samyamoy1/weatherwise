# WeatherWise - ML-Powered Weather Prediction App

## Concept & Vision

A sleek, atmospheric weather application that feels like looking through a window at the sky. The interface adapts to current weather conditions—warm oranges for sunny days, cool blues for rain, deep purples for night—creating an immersive experience where the UI itself becomes a weather indicator. ML-powered predictions go beyond simple forecasts to show confidence ranges and smart recommendations.

## Design Language

### Aesthetic Direction
Glass-morphism meets weather aesthetics. Frosted glass panels float over dynamic gradient backgrounds that shift based on weather conditions and time of day. Clean typography with subtle depth through shadows and blur effects.

### Color Palette
- **Sunny**: `#FF9F43` (warm orange) → `#FF6B6B` (coral)
- **Rainy**: `#4ECDC4` (teal) → `#556270` (slate)
- **Cloudy**: `#A8A8A8` → `#6C757D`
- **Night**: `#2C3E50` → `#1A1A2E`
- **Background Gradient**: Dynamic based on conditions
- **Glass Surface**: `rgba(255, 255, 255, 0.15)` with `backdrop-filter: blur(20px)`
- **Text Primary**: `#FFFFFF`
- **Text Secondary**: `rgba(255, 255, 255, 0.7)`

### Typography
- **Headings**: "Outfit" (Google Font) - geometric sans-serif with personality
- **Body**: "Inter" - clean and readable
- **Data/Numbers**: "JetBrains Mono" - for temperatures and metrics

### Spatial System
- Base unit: 8px
- Card padding: 24px
- Section gaps: 32px
- Border radius: 20px (cards), 12px (buttons), 50% (icons)

### Motion Philosophy
- **Page load**: Staggered fade-in with slight upward translation (300ms, ease-out, 100ms stagger)
- **Weather cards**: Subtle hover lift with shadow expansion
- **Temperature changes**: Number morphing animation
- **Background gradient**: Slow continuous animation (60s cycle)
- **Loading states**: Pulsing skeleton with glass effect

### Visual Assets
- **Icons**: Lucide React icons (consistent stroke width)
- **Weather icons**: Custom animated SVG weather symbols
- **Decorative**: Subtle particle effects for rain/snow, floating clouds

## Layout & Structure

### Main Layout
```
┌─────────────────────────────────────────────────────────┐
│  Header: Logo + App Name                                │
├─────────────────────────────────────────────────────────┤
│  City Search Bar (prominent, centered)                  │
├─────────────────────────────────────────────────────────┤
│  Current Weather Hero Card (large, prominent)           │
│  - Location name + date                                │
│  - Large temperature display                            │
│  - Weather condition + icon                             │
│  - High/Low temperatures                                │
├─────────────────────────────────────────────────────────┤
│  Weather Metrics Grid                                   │
│  ┌────────┬────────┬────────┬────────┐                 │
│  │Humidity│ Wind   │UV Index│Feels Like│               │
│  └────────┴────────┴────────┴────────┘                 │
├─────────────────────────────────────────────────────────┤
│  ML Forecast Section                                    │
│  "5-Day Prediction (Powered by ML)"                     │
│  ┌──────┬──────┬──────┬──────┬──────┐                  │
│  │Day 1 │Day 2 │Day 3 │Day 4 │Day 5 │                  │
│  │Temp  │Temp  │Temp  │Temp  │Temp  │                  │
│  │Rain% │Rain% │Rain% │Rain% │Rain% │                  │
│  │Icon  │Icon  │Icon  │Icon  │Icon  │                  │
│  └──────┴──────┴──────┴──────┴──────┘                  │
├─────────────────────────────────────────────────────────┤
│  Rain Probability Chart (simple bar visualization)      │
├─────────────────────────────────────────────────────────┤
│  Smart Recommendations (AI-powered tips)                 │
└─────────────────────────────────────────────────────────┘
```

### Responsive Strategy
- Desktop: Full layout as above
- Tablet: 2-column metrics grid, horizontal scroll for forecast
- Mobile: Single column, stacked cards, compact forecast

## Features & Interactions

### 1. City Search
- Large input field with search icon
- Auto-suggest dropdown with popular cities
- Recent searches stored in localStorage (last 5)
- Loading state while fetching data
- Error state for invalid cities with helpful message

### 2. Current Weather Display
- Animated weather icon matching conditions
- Large temperature with unit toggle (°C/°F)
- "Feels like" temperature
- High/Low for today
- Last updated timestamp
- Wind speed with direction
- Humidity percentage with visual indicator

### 3. ML-Predicted 5-Day Forecast
- Based on current conditions + historical patterns
- Each day shows:
  - Day name
  - Predicted high/low temperature
  - Rain probability (%)
  - Weather condition icon
  - Confidence indicator (high/medium/low)
- Temperature range visualization
- Smooth transitions between days

### 4. Rain Probability Section
- Visual bar chart showing rain % for each day
- Color gradient from green (0%) to red (100%)
- Tooltip with detailed breakdown
- Precipitation amount prediction (mm)

### 5. Smart Recommendations
- Contextual tips based on weather:
  - "Perfect day for outdoor activities"
  - "Don't forget your umbrella!"
  - "Stay hydrated - high UV expected"
  - "Layer up! Temperature dropping"
- Activity suggestions based on conditions

### Error Handling
- Invalid city: "City not found. Please check spelling."
- Network error: "Unable to connect. Check your internet."
- API limit: "Service temporarily busy. Try again later."
- Retry button for all error states

## Component Inventory

### SearchBar
- States: default, focused, loading, with-suggestions, error
- Glass morphism background
- Animated placeholder text
- Clear button when text present

### WeatherHeroCard
- States: loading (skeleton), loaded, error
- Dynamic gradient background based on weather
- Animated weather icon
- Temperature with smooth number transitions

### MetricCard
- States: loading, loaded
- Icon + label + value layout
- Progress bar for humidity
- Wind direction compass indicator

### ForecastCard
- States: loading, loaded, ml-predicted
- Day label with date
- Temperature range bar
- Rain probability badge
- Confidence meter
- Hover: slight lift + glow

### RainChart
- Horizontal bar visualization
- Animated fill on load
- Percentage labels
- Day labels on Y-axis

### RecommendationCard
- Icon + text layout
- Category color coding
- Dismissible with fade-out

### LoadingSkeleton
- Pulsing glass rectangles
- Matches layout of actual content
- Subtle shimmer animation

## Technical Approach

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS + custom CSS for animations
- **Icons**: Lucide React
- **State**: React hooks (useState, useEffect)
- **HTTP**: Native fetch API

### Backend
- **Framework**: FastAPI (Python)
- **ML Models**: 
  - Temperature prediction: Gradient Boosting Regressor
  - Rain prediction: Random Forest Classifier
- **Weather API**: OpenWeatherMap API
- **CORS**: Enabled for local development

### API Design

#### GET /api/weather?city={city_name}
Returns current weather + 5-day ML forecast

Response:
```json
{
  "current": {
    "temp": 25,
    "feels_like": 27,
    "humidity": 65,
    "wind_speed": 12,
    "wind_direction": "NW",
    "condition": "partly_cloudy",
    "description": "Partly Cloudy",
    "icon": "cloud-sun",
    "high": 28,
    "low": 22,
    "uv_index": 6
  },
  "forecast": [
    {
      "day": "Monday",
      "date": "2026-04-08",
      "high": 27,
      "low": 21,
      "rain_probability": 45,
      "precipitation_mm": 2.5,
      "condition": "rainy",
      "confidence": 0.78
    },
    ...
  ],
  "recommendations": [
    "Great day for a picnic!",
    "UV index is moderate - wear sunscreen"
  ]
}
```

#### GET /api/health
Health check endpoint

### Data Model
- Weather data stored in memory (no persistence needed)
- Recent searches tracked in frontend localStorage
- No user authentication required

### ML Implementation
1. Train models on synthetic historical weather data
2. Features: current temp, humidity, wind, day of year
3. Output: predicted temp range, rain probability
4. Confidence scores based on model variance
