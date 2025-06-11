import { useState, useEffect } from "react";
import axios from "axios";
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";
import ForecastCard from "./components/ForecastCard";
import video from "./baadall.mp4";

function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState("metric"); // 'metric' for Celsius, 'imperial' for Fahrenheit
  const [savedLocations, setSavedLocations] = useState([]);
  const [locationPermission, setLocationPermission] = useState(null);

  const API_KEY = import.meta.env.VITE_API_KEY;
  const API_URL = `https://api.openweathermap.org/data/2.5`;

  // Load saved locations from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("savedLocations");
    if (saved) {
      setSavedLocations(JSON.parse(saved));
    }
  }, []);

  // Save locations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
  }, [savedLocations]);

  // Request location access immediately on component mount
  useEffect(() => {
    const requestLocation = () => {
      console.log("Requesting location...");
      
      if (!navigator.geolocation) {
        console.log("Geolocation not supported");
        setError("Geolocation is not supported by your browser");
        return;
      }

      setLoading(true);
      setError("");

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };

      console.log("Calling getCurrentPosition with options:", options);
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log("Location obtained:", position);
          try {
            const { latitude, longitude } = position.coords;
            // Fetch weather by coordinates
            const weatherUrl = `${API_URL}/weather?lat=${latitude}&lon=${longitude}&units=${unit}&appid=${API_KEY}`;
            const weatherResponse = await axios.get(weatherUrl);
            setWeather(weatherResponse.data);

            // Fetch forecast by coordinates
            const forecastUrl = `${API_URL}/forecast?lat=${latitude}&lon=${longitude}&units=${unit}&cnt=40&appid=${API_KEY}`;
            const forecastResponse = await axios.get(forecastUrl);
            const dailyForecasts = processForecastData(forecastResponse.data.list);
            setForecast(dailyForecasts);
            setLocationPermission("granted");
          } catch (err) {
            console.error("Error fetching weather:", err);
            setError("Failed to fetch weather data for your location");
            setWeather(null);
            setForecast(null);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLoading(false);
          setLocationPermission("denied");
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setError("Location access was denied. Please allow location access in your browser settings and refresh the page.");
              break;
            case error.POSITION_UNAVAILABLE:
              setError("Location information is unavailable. Please check your device's location services and refresh the page.");
              break;
            case error.TIMEOUT:
              setError("Location request timed out. Please try again.");
              break;
            default:
              setError("An unknown error occurred while getting your location.");
          }
        },
        options
      );
    };

    // Request location immediately
    requestLocation();

    // Try requesting again after a short delay
    const timeoutId = setTimeout(requestLocation, 2000);

    return () => clearTimeout(timeoutId);
  }, [unit]); // Re-run when unit changes to update temperature units

  const toggleUnit = () => {
    setUnit(unit === "metric" ? "imperial" : "metric");
    if (weather) {
      fetchWeather(weather.name);
    }
  };

  const saveLocation = () => {
    if (weather && !savedLocations.find(loc => loc.name === weather.name)) {
      setSavedLocations([...savedLocations, { name: weather.name, country: weather.sys.country }]);
    }
  };

  const removeLocation = (locationName) => {
    setSavedLocations(savedLocations.filter(loc => loc.name !== locationName));
  };

  const fetchWeather = async (city) => {
    setLoading(true);
    setError("");
    try {
      // Fetch current weather
      const weatherUrl = `${API_URL}/weather?q=${city}&units=${unit}&appid=${API_KEY}`;
      const weatherResponse = await axios.get(weatherUrl);
      setWeather(weatherResponse.data);

      // Fetch 5-day forecast
      const forecastUrl = `${API_URL}/forecast?q=${city}&units=${unit}&cnt=40&appid=${API_KEY}`;
      const forecastResponse = await axios.get(forecastUrl);
      
      // Process forecast data to get daily averages
      const dailyForecasts = processForecastData(forecastResponse.data.list);
      setForecast(dailyForecasts);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError("City not found. Please try again.");
      } else {
        setError("An error occurred. Please try again later.");
      }
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  const processForecastData = (forecastList) => {
    const dailyData = {};
    
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!dailyData[date]) {
        dailyData[date] = {
          dt: item.dt,
          temp: {
            max: item.main.temp_max,
            min: item.main.temp_min
          },
          weather: [item.weather[0]],
          humidity: item.main.humidity,
          wind: item.wind.speed,
          pressure: item.main.pressure
        };
      } else {
        dailyData[date].temp.max = Math.max(dailyData[date].temp.max, item.main.temp_max);
        dailyData[date].temp.min = Math.min(dailyData[date].temp.min, item.main.temp_min);
      }
    });

    return Object.values(dailyData).slice(0, 5);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-100 relative overflow-hidden">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
      >
        <source src={video} type="video/mp4" />
        Your browser does not support the video tag
      </video>
      <div className="absolute top-0 left-0 w-full h-full bg-black/20 z-1"></div>
      <div className="bg-black/70 text-white rounded-lg shadow-lg p-8 max-w-4xl w-full z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Weather App</h1>
          <button
            onClick={toggleUnit}
            className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 transition-colors"
          >
            Switch to {unit === "metric" ? "°F" : "°C"}
          </button>
        </div>

        <SearchBar fetchWeather={fetchWeather} />

        {savedLocations.length > 0 && (
          <div className="mt-4 mb-6">
            <h2 className="text-xl font-semibold mb-2">Saved Locations</h2>
            <div className="flex flex-wrap gap-2">
              {savedLocations.map((location) => (
                <div
                  key={location.name}
                  className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2"
                >
                  <button
                    onClick={() => fetchWeather(location.name)}
                    className="hover:text-blue-300"
                  >
                    {location.name}, {location.country}
                  </button>
                  <button
                    onClick={() => removeLocation(location.name)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && <p className="text-center mt-4">Loading...</p>}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        
        {weather && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={saveLocation}
                className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 transition-colors"
                disabled={savedLocations.find(loc => loc.name === weather.name)}
              >
                {savedLocations.find(loc => loc.name === weather.name)
                  ? "Location Saved"
                  : "Save Location"}
              </button>
            </div>
            <WeatherCard weather={weather} unit={unit} />
            {forecast && <ForecastCard forecast={forecast} unit={unit} />}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
