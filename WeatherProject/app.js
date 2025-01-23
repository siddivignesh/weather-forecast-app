// Weather condition images mapped by description
const weatherImages = {
    "Clear": "clear.png",
    "Clouds": "cloudy.png",
    "Fog": "fog.png",
    "Overcast": "overcast.png",
    "Rain": "rainy.png",
    "Snow": "snow.png",
    "Sunny": "sunny.png",
    "Wind": "wind.png"
};

// API key for OpenWeatherMap API
const apiKey = 'your-api-key';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const currentLocationBtn = document.getElementById('currentLocationBtn');
const recentCities = document.getElementById('recentCities');
const weatherDisplay = document.getElementById('weatherDisplay');
const extendedForecast = document.getElementById('extendedForecast');

const cityName = document.getElementById('cityName');
const weatherDescription = document.getElementById('weatherDescription');
const temperature = document.getElementById('temperature');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const weatherIcon = document.getElementById('weatherIcon');

// Fetch current weather data by city
const getWeatherData = async (city) => {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        if (!response.ok) throw new Error('City not found');
        return await response.json();
    } catch (error) {
        alert(error.message); // Handle error if the city is not found
        return null;
    }
};

// Fetch extended forecast (5-day) data by city
const getExtendedForecast = async (city) => {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        );
        if (!response.ok) throw new Error('Unable to fetch extended forecast');
        return await response.json();
    } catch (error) {
        alert(error.message); // Handle error for the extended forecast
        return null;
    }
};

// Update current weather display
const updateWeatherDisplay = (data) => {
    weatherDisplay.classList.remove('hidden');
    cityName.textContent = data.name; // Set city name
    weatherDescription.textContent = `Weather: ${data.weather[0].description}`; // Set weather description
    temperature.textContent = `Temperature: ${data.main.temp} °C`; // Set temperature
    humidity.textContent = `Humidity: ${data.main.humidity}%`; // Set humidity
    windSpeed.textContent = `Wind Speed: ${data.wind.speed} m/s`; // Set wind speed

    // Get the weather description and map it to an image
    const description = data.weather[0].main;
    const imageName = weatherImages[description] || "clear.png"; // Default to "clear.png" if not found
    weatherIcon.src = `resources/${imageName}`; // Set weather icon
};

// Update extended forecast display
const updateExtendedForecast = (data) => {
    extendedForecast.classList.remove('hidden');
    extendedForecast.innerHTML = '';

    // Group forecasts by date
    const forecastByDate = {};
    data.list.forEach(forecast => {
        const forecastDate = new Date(forecast.dt * 1000).toLocaleDateString();
        if (!forecastByDate[forecastDate]) {
            forecastByDate[forecastDate] = forecast; // Store first forecast for each date
        }
    });

    // Get the next 5 days of forecast
    const forecastDates = Object.keys(forecastByDate).slice(0, 5);

    forecastDates.forEach(date => {
        const forecast = forecastByDate[date];
        const card = document.createElement('div');
        card.className = 'p-4 border rounded bg-white text-center';
        card.innerHTML = `
            <p>${date}</p> <!-- Display forecast date -->
            <img src="resources/${weatherImages[forecast.weather[0].main] || 'clear.png'}" alt="Weather icon"> <!-- Display weather icon -->
            <p>${forecast.main.temp} °C</p> <!-- Display temperature -->
            <p>Wind: ${forecast.wind.speed} m/s</p> <!-- Display wind speed -->
            <p>Humidity: ${forecast.main.humidity}%</p> <!-- Display humidity -->
        `;
        extendedForecast.appendChild(card); // Append forecast card to the extended forecast section
    });
};

// Add a city to the recent cities dropdown
const addRecentCity = (city) => {
    if (!recentCities.querySelector(`[value="${city}"]`)) {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        recentCities.appendChild(option);
        recentCities.classList.remove('hidden');
    }
};

// Search button event listener
searchBtn.addEventListener('click', async () => {
    const city = cityInput.value.trim();
    if (!city) {
        alert('Please enter a city name.'); // Prompt if no city entered
        return;
    }
    const data = await getWeatherData(city);
    if (data) {
        updateWeatherDisplay(data); // Update weather display
        addRecentCity(city); // Add city to recent cities dropdown
        const forecastData = await getExtendedForecast(city);
        if (forecastData) updateExtendedForecast(forecastData); // Update extended forecast
    }
});

// Current location button event listener
currentLocationBtn.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
            );
            const data = await response.json();
            updateWeatherDisplay(data); // Update weather display for current location
            const forecastData = await getExtendedForecast(data.name);
            if (forecastData) updateExtendedForecast(forecastData); // Update extended forecast for current location
        } catch (error) {
            alert('Failed to fetch weather for your location.'); // Handle error if geolocation fails
        }
    });
});

// Recent cities dropdown change event listener
recentCities.addEventListener('change', async (event) => {
    const city = event.target.value;
    const data = await getWeatherData(city);
    if (data) {
        updateWeatherDisplay(data); // Update weather display
        const forecastData = await getExtendedForecast(city);
        if (forecastData) updateExtendedForecast(forecastData); // Update extended forecast
    }
});
