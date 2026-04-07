import { useState, useEffect } from 'react'
import { 
  Search, MapPin, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, 
  Wind, Droplets, Thermometer, Eye, Gauge, Sunrise, Sunset, 
  AlertTriangle, CheckCircle, Info, X, RefreshCw, Zap, Leaf
} from 'lucide-react'

const API_BASE = '/api'

const weatherIcons = {
  sunny: Sun,
  partly_cloudy: Cloud,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: CloudSnow,
  thunderstorm: CloudLightning,
}

const popularCities = [
  'New York', 'London', 'Tokyo', 'Paris', 'Sydney', 
  'Dubai', 'Singapore', 'Mumbai', 'Berlin', 'Toronto'
]

function App() {
  const [city, setCity] = useState('')
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [recentSearches, setRecentSearches] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [unit, setUnit] = useState('C')

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) setRecentSearches(JSON.parse(saved))
  }, [])

  const saveSearch = (cityName) => {
    const updated = [cityName, ...recentSearches.filter(c => c !== cityName)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const fetchWeather = async (cityName) => {
    if (!cityName.trim()) return
    
    setLoading(true)
    setError(null)
    setShowSuggestions(false)
    
    try {
      const response = await fetch(`${API_BASE}/weather?city=${encodeURIComponent(cityName)}`)
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Failed to fetch weather')
      }
      const data = await response.json()
      setWeatherData(data)
      saveSearch(cityName)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchWeather(city)
  }

  const handleSuggestionClick = (cityName) => {
    setCity(cityName)
    fetchWeather(cityName)
  }

  const convertTemp = (temp) => {
    if (unit === 'F') return Math.round(temp * 9/5 + 32)
    return Math.round(temp)
  }

  const getGradientClass = () => {
    if (!weatherData) return 'weather-gradient-sunny'
    const condition = weatherData.current.condition
    if (condition === 'sunny') return 'weather-gradient-sunny'
    if (condition === 'rainy' || condition === 'thunderstorm') return 'weather-gradient-rainy'
    if (condition === 'snowy') return 'weather-gradient-snowy'
    if (condition === 'cloudy' || condition === 'partly_cloudy') return 'weather-gradient-cloudy'
    return 'weather-gradient-night'
  }

  const getRainBarColor = (prob) => {
    if (prob < 25) return 'bg-emerald-400'
    if (prob < 50) return 'bg-yellow-400'
    if (prob < 75) return 'bg-orange-400'
    return 'bg-red-400'
  }

  const getConfidenceColor = (conf) => {
    if (conf >= 0.8) return 'text-emerald-400'
    if (conf >= 0.6) return 'text-yellow-400'
    return 'text-orange-400'
  }

  return (
    <div className={`min-h-screen ${getGradientClass()} transition-all duration-1000`}>
      <div className="min-h-screen bg-black/20 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8 animate-fade-in-up">
            <h1 className="font-outfit text-4xl md:text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <Cloud className="w-10 h-10" />
              WeatherWise
            </h1>
            <p className="text-white/70 font-inter">ML-Powered Weather Prediction</p>
          </header>

          <form onSubmit={handleSubmit} className="relative mb-8 animate-fade-in-up delay-100">
            <div className="glass rounded-2xl p-2 flex items-center gap-2">
              <Search className="w-6 h-6 text-white/70 ml-3" />
              <input
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Enter city name..."
                className="flex-1 bg-transparent text-white text-lg py-3 px-2 font-inter"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Search'}
              </button>
            </div>

            {showSuggestions && (city.length > 0 || recentSearches.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 glass rounded-xl overflow-hidden z-10">
                {recentSearches.length > 0 && (
                  <div className="p-3 border-b border-white/10">
                    <p className="text-white/50 text-sm mb-2">Recent</p>
                    {recentSearches.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick(c)}
                        className="block w-full text-left text-white/80 hover:bg-white/10 px-3 py-2 rounded-lg"
                      >
                        <MapPin className="w-4 h-4 inline mr-2" />
                        {c}
                      </button>
                    ))}
                  </div>
                )}
                <div className="p-3">
                  <p className="text-white/50 text-sm mb-2">Popular Cities</p>
                  {popularCities
                    .filter(c => c.toLowerCase().includes(city.toLowerCase()))
                    .slice(0, 5)
                    .map((c, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick(c)}
                        className="block w-full text-left text-white/80 hover:bg-white/10 px-3 py-2 rounded-lg"
                      >
                        {c}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </form>

          {error && (
            <div className="glass rounded-2xl p-6 mb-6 animate-fade-in-up">
              <div className="flex items-center gap-3 text-red-300">
                <AlertTriangle className="w-6 h-6" />
                <div>
                  <p className="font-medium">{error}</p>
                  <p className="text-sm text-red-200/70 mt-1">Please check the city name and try again</p>
                </div>
              </div>
            </div>
          )}

          {loading && <LoadingSkeleton />}

          {weatherData && !loading && (
            <div className="space-y-6">
              <CurrentWeather 
                data={weatherData.current} 
                unit={unit}
                setUnit={setUnit}
                convertTemp={convertTemp}
              />

              <MetricsGrid data={weatherData.current} convertTemp={convertTemp} />

              <ForecastSection 
                forecast={weatherData.forecast} 
                unit={unit}
                convertTemp={convertTemp}
                getRainBarColor={getRainBarColor}
                getConfidenceColor={getConfidenceColor}
              />

              <RainProbabilityChart 
                forecast={weatherData.forecast}
                getRainBarColor={getRainBarColor}
              />

              <RecommendationsSection recommendations={weatherData.recommendations} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-8">
        <div className="shimmer h-6 w-48 rounded mb-4"></div>
        <div className="shimmer h-20 w-32 rounded mb-4"></div>
        <div className="shimmer h-4 w-64 rounded"></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass rounded-xl p-4">
            <div className="shimmer h-4 w-16 rounded mb-2"></div>
            <div className="shimmer h-8 w-20 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CurrentWeather({ data, unit, setUnit, convertTemp }) {
  const WeatherIcon = weatherIcons[data.icon] || Cloud
  
  return (
    <div className="glass rounded-3xl p-8 text-center animate-fade-in-up delay-200">
      <div className="flex items-center justify-center gap-2 text-white/70 mb-2">
        <MapPin className="w-5 h-5" />
        <span className="text-xl font-medium">{data.location}, {data.country}</span>
      </div>
      <p className="text-white/60 mb-6">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      
      <div className="flex items-center justify-center gap-6 mb-6">
        <WeatherIcon className="w-24 h-24 text-white animate-float" />
        <div>
          <div className="flex items-start">
            <span className="font-mono text-7xl font-bold text-white">{convertTemp(data.temp)}</span>
            <span className="text-3xl text-white/70 mt-2">°{unit}</span>
          </div>
          <p className="text-xl text-white/80 mt-1">{data.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 text-white/60 mb-4">
        <span>H: {convertTemp(data.high)}°</span>
        <span>L: {convertTemp(data.low)}°</span>
      </div>

      <button
        onClick={() => setUnit(unit === 'C' ? 'F' : 'C')}
        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-all"
      >
        Switch to °{unit === 'C' ? 'F' : 'C'}
      </button>
    </div>
  )
}

function MetricsGrid({ data, convertTemp }) {
  const metrics = [
    { icon: Droplets, label: 'Humidity', value: `${data.humidity}%`, extra: null },
    { icon: Wind, label: 'Wind', value: `${data.wind_speed} km/h`, extra: data.wind_direction },
    { icon: Eye, label: 'Visibility', value: `${data.visibility} km`, extra: null },
    { icon: Thermometer, label: 'Feels Like', value: `${convertTemp(data.feels_like)}°`, extra: null },
    { icon: Gauge, label: 'Pressure', value: `${data.pressure} hPa`, extra: null },
    { icon: Sun, label: 'UV Index', value: data.uv_index.toFixed(1), extra: null },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in-up delay-300">
      {metrics.map((metric, i) => (
        <div key={i} className="glass rounded-xl p-5 hover:bg-white/15 transition-all">
          <div className="flex items-center gap-2 text-white/60 mb-2">
            <metric.icon className="w-5 h-5" />
            <span className="text-sm">{metric.label}</span>
          </div>
          <p className="font-mono text-2xl text-white font-medium">{metric.value}</p>
          {metric.extra && <p className="text-white/50 text-sm mt-1">{metric.extra}</p>}
        </div>
      ))}
    </div>
  )
}

function ForecastSection({ forecast, unit, convertTemp, getRainBarColor, getConfidenceColor }) {
  return (
    <div className="glass rounded-2xl p-6 animate-fade-in-up delay-400">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-6 h-6 text-yellow-400" />
        <h2 className="font-outfit text-xl font-semibold text-white">5-Day ML Forecast</h2>
        <span className="text-white/50 text-sm ml-auto">Powered by Machine Learning</span>
      </div>
      
      <div className="grid grid-cols-5 gap-3">
        {forecast.map((day, i) => {
          const WeatherIcon = weatherIcons[day.condition] || Cloud
          return (
            <div 
              key={i} 
              className="bg-white/10 rounded-xl p-4 text-center hover:bg-white/15 transition-all hover:-translate-y-1"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <p className="text-white font-medium text-sm mb-1">{day.day}</p>
              <p className="text-white/50 text-xs mb-3">{day.date.split('-').slice(1).join('/')}</p>
              <WeatherIcon className="w-10 h-10 text-white mx-auto mb-3" />
              <div className="font-mono text-white mb-2">
                <span className="text-lg">{convertTemp(day.high)}°</span>
                <span className="text-white/50 text-sm ml-1">{convertTemp(day.low)}°</span>
              </div>
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getRainBarColor(day.rain_probability)}/20 text-white`}>
                <Droplets className="w-3 h-3" />
                {day.rain_probability}%
              </div>
              <p className={`text-xs mt-2 ${getConfidenceColor(day.confidence)}`}>
                {Math.round(day.confidence * 100)}% confidence
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RainProbabilityChart({ forecast, getRainBarColor }) {
  const maxRain = Math.max(...forecast.map(f => f.rain_probability), 100)
  
  return (
    <div className="glass rounded-2xl p-6 animate-fade-in-up delay-500">
      <h2 className="font-outfit text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <CloudRain className="w-6 h-6 text-blue-400" />
        Rain Probability
      </h2>
      
      <div className="space-y-4">
        {forecast.map((day, i) => (
          <div key={i} className="flex items-center gap-4">
            <p className="text-white/70 w-24 text-sm">{day.day}</p>
            <div className="flex-1 h-6 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getRainBarColor(day.rain_probability)} transition-all duration-1000 ease-out rounded-full flex items-center justify-end pr-2`}
                style={{ width: `${(day.rain_probability / maxRain) * 100}%` }}
              >
                <span className="text-white text-xs font-medium">{day.rain_probability}%</span>
              </div>
            </div>
            <p className="text-white/50 text-sm w-16 text-right">{day.precipitation_mm} mm</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function RecommendationsSection({ recommendations }) {
  const getIcon = (text) => {
    if (text.includes('🔥')) return Thermometer
    if (text.includes('🧥')) return Thermometer
    if (text.includes('☀️')) return Sun
    if (text.includes('🌂')) return CloudRain
    if (text.includes('💨')) return Wind
    if (text.includes('⚡')) return Zap
    if (text.includes('🌻')) return Leaf
    return Info
  }

  return (
    <div className="glass rounded-2xl p-6 animate-fade-in-up delay-500">
      <h2 className="font-outfit text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <CheckCircle className="w-6 h-6 text-emerald-400" />
        Smart Recommendations
      </h2>
      
      <div className="grid gap-3">
        {recommendations.map((rec, i) => {
          const Icon = getIcon(rec)
          return (
            <div 
              key={i} 
              className="flex items-center gap-3 bg-white/10 rounded-xl p-4 hover:bg-white/15 transition-all"
            >
              <Icon className="w-5 h-5 text-white/70 flex-shrink-0" />
              <p className="text-white">{rec}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App
