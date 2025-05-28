import React from "react";

const WeatherCard = ({ weather }) => {
  // Function to get weather emoji
  const getWeatherEmoji = (weatherMain) => {
    switch (weatherMain.toLowerCase()) {
      case 'clear':
        return '☀️';
      case 'clouds':
        return '☁️';
      case 'rain':
        return '🌧️';
      case 'drizzle':
        return '🌦️';
      case 'thunderstorm':
        return '⛈️';
      case 'snow':
        return '❄️';
      case 'mist':
      case 'fog':
        return '🌫️';
      default:
        return '🌈';
    }
  };

  // Function to get humidity emoji
  const getHumidityEmoji = (humidity) => {
    if (humidity > 80) return '💧';
    if (humidity > 60) return '💦';
    return '💨';
  };

  // Function to get wind emoji
  const getWindEmoji = (speed) => {
    if (speed > 10) return '🌪️';
    if (speed > 5) return '💨';
    return '🌬️';
  };

  // Function to get temperature emoji
  const getTempEmoji = (temp) => {
    if (temp > 30) return '🔥';
    if (temp > 20) return '😎';
    if (temp > 10) return '😊';
    if (temp > 0) return '❄️';
    return '🥶';
  };

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-semibold text-center">
        {weather.name}, {weather.sys.country}
      </h2>
      <div className="flex justify-center items-center mt-4">
        <img
          src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
          alt={weather.weather[0].description}
          className="w-16 h-16"
        />
        <p className="text-4xl font-bold">
          {Math.round(weather.main.temp)}°C {getTempEmoji(weather.main.temp)}
        </p>
      </div>
      <p className="text-center text-gray-400 capitalize">
        {weather.weather[0].description} {getWeatherEmoji(weather.weather[0].main)}
      </p>
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="text-center">
          <p className="text-gray-400">Humidity</p>
          <p className="font-bold">
            {weather.main.humidity}% {getHumidityEmoji(weather.main.humidity)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-400">Wind</p>
          <p className="font-bold">
            {weather.wind.speed} m/s {getWindEmoji(weather.wind.speed)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-400">Pressure</p>
          <p className="font-bold">{weather.main.pressure} hPa</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400">Feels like</p>
          <p className="font-bold">
            {Math.round(weather.main.feels_like)}°C {getTempEmoji(weather.main.feels_like)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
