import React from 'react';

const ForecastCard = ({ forecast }) => {
  // Function to get day name from timestamp
  const getDayName = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Function to get weather icon
  const getWeatherIcon = (weatherCode) => {
    const iconMap = {
      '01d': '☀️',
      '01n': '🌙',
      '02d': '⛅',
      '02n': '☁️',
      '03d': '☁️',
      '03n': '☁️',
      '04d': '☁️',
      '04n': '☁️',
      '09d': '🌧️',
      '09n': '🌧️',
      '10d': '🌦️',
      '10n': '🌧️',
      '11d': '⛈️',
      '11n': '⛈️',
      '13d': '❄️',
      '13n': '❄️',
      '50d': '🌫️',
      '50n': '🌫️',
    };
    return iconMap[weatherCode] || '☀️';
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">5-Day Forecast</h2>
      <div className="grid grid-cols-5 gap-2">
        {forecast.map((day, index) => (
          <div
            key={index}
            className="bg-white/10 rounded-lg p-3 text-center backdrop-blur-sm"
          >
            <div className="text-lg font-medium">{getDayName(day.dt)}</div>
            <div className="text-2xl my-2">
              {getWeatherIcon(day.weather[0].icon)}
            </div>
            <div className="text-sm">
              <div className="font-medium">{Math.round(day.temp.max)}°C</div>
              <div className="text-gray-300">{Math.round(day.temp.min)}°C</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForecastCard; 