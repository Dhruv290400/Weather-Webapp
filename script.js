/**
 * Indian Weather App - Main JavaScript File
 * Author: Dhruv Singh
 * Description: Handles weather data fetching, UI interactions, and animations
 */

// ===== CONFIGURATION =====
// Note: In production, these should be stored in environment variables
const WEATHER_API_KEY = "3a81a6f94cfc47cdc20b83dc44ee0694";

// API Endpoints - Using free alternative for news
const API_ENDPOINTS = {
  weather: (city) => `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`,
  forecast: (city) => `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${WEATHER_API_KEY}&units=metric`,
  airPollution: (lat, lon) => `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`,
  // Using a more reliable free news source
  news: `https://newsdata.io/api/1/news?apikey=pub_58827b8fced0b06b9d6b47ba9e6169095b40c&q=weather%20india&language=en&category=environment`
};

// Constants
const AQI_LEVELS = {
  1: { text: "Good", color: "#00e400" },
  2: { text: "Fair", color: "#ffff00" },
  3: { text: "Moderate", color: "#ff7e00" },
  4: { text: "Poor", color: "#ff0000" },
  5: { text: "Very Poor", color: "#7e0023" }
};

const DEFAULT_CITY = "Delhi";
const FORECAST_HOURS = 6;

// ===== UTILITY FUNCTIONS =====

/**
 * Safely get DOM element by ID with error handling
 * @param {string} id - Element ID
 * @returns {HTMLElement|null} - DOM element or null
 */
function getElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Element with ID '${id}' not found`);
  }
  return element;
}

/**
 * Get current time-based greeting
 * @returns {string} - Appropriate greeting with emoji
 */
function getTimeBasedGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good Morning ☀️";
  if (hour >= 12 && hour < 17) return "Good Afternoon 🌞";
  if (hour >= 17 && hour < 20) return "Good Evening 🌇";
  return "Good Night 🌙";
}

/**
 * Get weather-based advice
 * @param {string} weatherMain - Main weather condition
 * @returns {string} - Weather advice
 */
function getWeatherAdvice(weatherMain) {
  const weather = weatherMain.toLowerCase();
  if (weather.includes("rain")) return "Rainy – Carry an umbrella!";
  if (weather.includes("cloud")) return "Cloudy – May stay dry";
  if (weather.includes("clear")) return "Sunny day – No rain expected";
  return "Mild weather – Enjoy your day!";
}

/**
 * Determine if it's currently night time
 * @param {Object} weatherData - Weather data object with sunrise/sunset times
 * @returns {boolean} - True if it's night time
 */
function isNightTime(weatherData) {
  if (!weatherData || !weatherData.sys) {
    // Fallback to local time if no weather data
    const hour = new Date().getHours();
    return hour < 6 || hour > 18;
  }
  
  const now = Date.now() / 1000; // Convert to Unix timestamp
  const sunrise = weatherData.sys.sunrise;
  const sunset = weatherData.sys.sunset;
  
  return now < sunrise || now > sunset;
}

// ===== UI NAVIGATION FUNCTIONS =====

/**
 * Show main page and hide landing page with smooth transition
 */
function showMainPage() {
  const landingPage = getElement("landingPage");
  const mainPage = getElement("mainPage");
  
  if (landingPage && mainPage) {
    landingPage.style.display = "none";
    mainPage.style.display = "block";
    
    // Focus on city input for better UX
    const cityInput = getElement("cityInput");
    if (cityInput) {
      setTimeout(() => cityInput.focus(), 100);
    }
  }
}

/**
 * Show landing page and hide main page
 */
function showLandingPage() {
  const landingPage = getElement("landingPage");
  const mainPage = getElement("mainPage");
  
  if (landingPage && mainPage) {
    landingPage.style.display = "block";
    mainPage.style.display = "none";
    
    // Reset to default background
    resetWeatherBackground();
  }
}

/**
 * Reset background and animations to default state
 */
function resetWeatherBackground() {
  const body = document.body;
  
  // Remove all weather classes
  body.className = body.className.replace(/weather-\w+(-\w+)?/g, '');
  
  // Hide all animations
  const animations = document.querySelectorAll('.weather-animations > div');
  animations.forEach(el => {
    if (el) el.style.display = 'none';
  });
  
  // Reset to default background
  body.style.background = 'linear-gradient(135deg, var(--light-blue), var(--accent-blue))';
  body.style.color = 'var(--text-color)';
}

/**
 * Search for weather in a specific city (used by quick city buttons)
 * @param {string} city - City name to search for
 */
function searchCity(city) {
  const cityInput = getElement("cityInput");
  if (cityInput) {
    cityInput.value = city;
    getWeather();
  }
}

/**
 * Toggle theme between light and dark (placeholder function)
 */
function toggleTheme() {
  // This is a placeholder for future theme toggle functionality
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    // Toggle between sun and moon icons
    themeToggle.textContent = themeToggle.textContent === '🌙' ? '☀️' : '🌙';
    
    // Add a simple animation
    themeToggle.style.transform = 'rotate(180deg)';
    setTimeout(() => {
      themeToggle.style.transform = 'rotate(0deg)';
    }, 300);
  }
}

// ===== WEATHER ANIMATION FUNCTIONS =====

/**
 * Control weather animations and background based on current conditions
 * @param {string} weatherMain - Main weather condition
 * @param {number} windSpeed - Wind speed in m/s
 * @param {Object} weatherData - Complete weather data object (optional)
 */
function controlWeatherAnimations(weatherMain, windSpeed, weatherData = null) {
  const animations = {
    rain: document.querySelector(".rain"),
    wind: document.querySelector(".wind"),
    sun: document.querySelector(".sunshine"),
    cloud: document.querySelector(".cloudy"),
    snow: document.querySelector(".snow"),
    thunderstorm: document.querySelector(".thunderstorm")
  };
  
  // Hide all animations first
  Object.values(animations).forEach(el => {
    if (el) el.style.display = "none";
  });
  
  // Determine if it's day or night
  const isNight = isNightTime(weatherData);
  
  // Change background and show relevant animations
  const weather = weatherMain.toLowerCase();
  const body = document.body;
  
  // Remove all weather classes first
  body.className = body.className.replace(/weather-\w+(-\w+)?/g, '');
  
  if (weather.includes("thunderstorm") || weather.includes("storm")) {
    body.classList.add('weather-thunderstorm');
    if (animations.thunderstorm) animations.thunderstorm.style.display = "block";
    if (animations.rain) animations.rain.style.display = "block";
  } else if (weather.includes("rain") || weather.includes("drizzle")) {
    body.classList.add('weather-rain');
    if (animations.rain) animations.rain.style.display = "block";
  } else if (weather.includes("snow")) {
    body.classList.add('weather-snow');
    if (animations.snow) animations.snow.style.display = "block";
  } else if (weather.includes("mist") || weather.includes("fog") || weather.includes("haze")) {
    body.classList.add('weather-mist');
    if (animations.cloud) animations.cloud.style.display = "block";
  } else if (weather.includes("clear")) {
    if (isNight) {
      body.classList.add('weather-clear-night');
    } else {
      body.classList.add('weather-clear-day');
      if (animations.sun) animations.sun.style.display = "block";
    }
  } else if (weather.includes("cloud")) {
    if (isNight) {
      body.classList.add('weather-clouds-night');
    } else {
      body.classList.add('weather-clouds-day');
    }
    if (animations.cloud) animations.cloud.style.display = "block";
  } else {
    // Default case
    if (isNight) {
      body.classList.add('weather-clear-night');
    } else {
      body.classList.add('weather-clear-day');
    }
  }
  
  // Show wind animation for strong winds regardless of weather
  if (windSpeed > 4.5 && animations.wind) {
    animations.wind.style.display = "block";
    body.classList.add('weather-windy');
  }
  
  // Add smooth transition effect
  body.style.transition = 'background 1.5s ease-in-out, color 0.5s ease-in-out';
}

// ===== DATA PROCESSING FUNCTIONS =====

/**
 * Process air quality data
 * @param {Object} airData - Air pollution data from API
 * @returns {Object} - Processed AQI information
 */
function processAirQualityData(airData) {
  if (!airData?.list?.[0]) {
    return { aqi: 0, aqiText: "Unknown", pm25: 0, pm10: 0 };
  }
  
  const aqi = airData.list[0].main.aqi;
  const pm25 = airData.list[0].components.pm2_5 || 0;
  const pm10 = airData.list[0].components.pm10 || 0;
  const aqiInfo = AQI_LEVELS[aqi] || { text: "Unknown", color: "#666" };
  
  return {
    aqi,
    aqiText: aqiInfo.text,
    aqiColor: aqiInfo.color,
    pm25: pm25.toFixed(1),
    pm10: pm10.toFixed(1)
  };
}

/**
 * Generate weather display HTML
 * @param {Object} weatherData - Weather data from API
 * @param {Object} aqiInfo - Processed air quality information
 * @returns {string} - HTML string for weather display
 */
function generateWeatherHTML(weatherData, aqiInfo) {
  const greeting = getTimeBasedGreeting();
  const advice = getWeatherAdvice(weatherData.weather[0].main);
  
  return `
    <div class="weather-box">
      <div class="greeting">${greeting}</div>
      <h3>${weatherData.name}, ${weatherData.sys.country}</h3>
      <img class="weather-icon" 
           src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png" 
           alt="${weatherData.weather[0].description}" />
      <div class="temp">${weatherData.main.temp.toFixed(1)}°C</div>
      <p>📌 ${weatherData.weather[0].main} - ${weatherData.weather[0].description}</p>
      <p>🧪 Feels like: ${weatherData.main.feels_like.toFixed(1)}°C</p>
      <p>💧 Humidity: ${weatherData.main.humidity}%</p>
      <p>🌬️ Wind: ${weatherData.wind.speed} m/s</p>
      <p>☁️ Cloudiness: ${weatherData.clouds.all}%</p>
      <p>⚠️ ${advice}</p>
      <hr>
      <p>🌫️ <strong>Air Quality:</strong> 
         <span style="color: ${aqiInfo.aqiColor}; font-weight: bold;">
           ${aqiInfo.aqiText} (Level: ${aqiInfo.aqi})
         </span>
      </p>
      <p>PM2.5: ${aqiInfo.pm25} µg/m³, PM10: ${aqiInfo.pm10} µg/m³</p>
    </div>
  `;
}

/**
 * Generate forecast display HTML
 * @param {Object} forecastData - Forecast data from API
 * @returns {string} - HTML string for forecast display
 */
function generateForecastHTML(forecastData) {
  const now = new Date();
  const nextHours = forecastData.list
    .filter(item => new Date(item.dt_txt) > now)
    .slice(0, FORECAST_HOURS);

  const forecastCards = nextHours.map(item => {
    const time = new Date(item.dt_txt).toLocaleTimeString("en-IN", {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `
      <div class="forecast-card">
        <p><strong>${time}</strong></p>
        <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" 
             alt="${item.weather[0].description}" />
        <p>${item.main.temp.toFixed(1)}°C</p>
        <p class="forecast-desc">${item.weather[0].main}</p>
      </div>
    `;
  }).join("");

  return `
    <h3>🕰️ Next ${FORECAST_HOURS} Hours</h3>
    <div class="forecast-container">${forecastCards}</div>
  `;
}

/**
 * Generate news display HTML
 * @param {Object} newsData - News data from API
 * @returns {string} - HTML string for news display
 */
function generateNewsHTML(newsData) {
  let newsHTML = "<h3>🌐 Latest Weather & Climate News</h3>";
  
  // Handle different API response formats
  const articles = newsData.articles || newsData.results || [];
  
  if (!articles || articles.length === 0) {
    // Provide meaningful fallback content instead of blank section
    newsHTML += `
      <div class="news-fallback">
        <div class="fallback-content">
          <h4>🌤️ Weather Tips & Information</h4>
          <div class="weather-tips">
            <div class="tip-card">
              <h5>☀️ Summer Safety</h5>
              <p>Stay hydrated and avoid direct sunlight during peak hours (10 AM - 4 PM)</p>
            </div>
            <div class="tip-card">
              <h5>🌧️ Monsoon Preparedness</h5>
              <p>Keep umbrellas handy and avoid waterlogged areas during heavy rains</p>
            </div>
            <div class="tip-card">
              <h5>❄️ Winter Care</h5>
              <p>Dress in layers and protect yourself from cold winds and fog</p>
            </div>
            <div class="tip-card">
              <h5>🌫️ Air Quality</h5>
              <p>Check AQI levels daily and wear masks when pollution levels are high</p>
            </div>
          </div>
        </div>
      </div>
    `;
    return newsHTML;
  }

  newsHTML += '<div class="news-scroll-area">';
  articles.slice(0, 8).forEach(article => {
    const title = article.title || "Weather Update";
    const description = article.description || article.content || "Latest weather information available.";
    const url = article.url || article.link || "#";
    const publishedAt = new Date(article.publishedAt || article.pubDate || Date.now()).toLocaleDateString("en-IN");
    
    newsHTML += `
      <article class="news-card">
        <h4>${title}</h4>
        <p>${description.substring(0, 150)}${description.length > 150 ? '...' : ''}</p>
        <div class="news-meta">
          <span class="news-date">${publishedAt}</span>
          ${url !== "#" ? `<a href="${url}" target="_blank" rel="noopener noreferrer">Read more →</a>` : ''}
        </div>
      </article>
    `;
  });
  newsHTML += '</div>';
  
  return newsHTML;
}

// ===== MAIN WEATHER FUNCTION =====

/**
 * Main function to fetch and display weather data
 * Coordinates all weather-related functionality
 */
async function getWeather() {
  try {
    // Get user input and DOM elements
    const cityInput = getElement("cityInput");
    const city = cityInput?.value?.trim() || DEFAULT_CITY;
    
    const weatherBox = getElement("weatherResult");
    const forecastBox = getElement("forecastResult");
    const newsBox = getElement("newsResult");
    
    if (!weatherBox || !forecastBox || !newsBox) {
      console.error("Required DOM elements not found");
      return;
    }

    // Show loading states
    weatherBox.innerHTML = '<div class="loading">🔄 Loading weather data...</div>';
    forecastBox.innerHTML = '<div class="loading">🔄 Loading forecast...</div>';
    newsBox.innerHTML = '<div class="loading">🔄 Loading news...</div>';

    // Fetch all data concurrently
    const [weatherRes, forecastRes, newsRes] = await Promise.all([
      fetch(API_ENDPOINTS.weather(city)),
      fetch(API_ENDPOINTS.forecast(city)),
      fetch(API_ENDPOINTS.news)
    ]);

    // Check for API errors
    if (!weatherRes.ok) {
      throw new Error(`Weather API error: ${weatherRes.status}`);
    }
    if (!forecastRes.ok) {
      throw new Error(`Forecast API error: ${forecastRes.status}`);
    }

    // Parse JSON data
    const weatherData = await weatherRes.json();
    const forecastData = await forecastRes.json();
    const newsData = newsRes.ok ? await newsRes.json() : { articles: [] };

    // Fetch air quality data
    const { lat, lon } = weatherData.coord;
    const airRes = await fetch(API_ENDPOINTS.airPollution(lat, lon));
    const airData = airRes.ok ? await airRes.json() : null;
    
    // Process data
    const aqiInfo = processAirQualityData(airData);
    
    // Update UI
    weatherBox.innerHTML = generateWeatherHTML(weatherData, aqiInfo);
    forecastBox.innerHTML = generateForecastHTML(forecastData);
    newsBox.innerHTML = generateNewsHTML(newsData);
    
    // Control animations and background
    controlWeatherAnimations(weatherData.weather[0].main, weatherData.wind.speed, weatherData);
    
    // Clear input and show success
    if (cityInput) cityInput.value = "";
    
  } catch (error) {
    console.error("Error fetching weather data:", error);
    
    // Show user-friendly error messages
    const weatherBox = getElement("weatherResult");
    const forecastBox = getElement("forecastResult");
    const newsBox = getElement("newsResult");
    
    const errorMessage = `
      <div class="error-message">
        <h3>❌ Unable to fetch weather data</h3>
        <p>Please check your internet connection and try again.</p>
        <p>Make sure you entered a valid Indian city name.</p>
        <button onclick="getWeather()" class="retry-btn">Try Again</button>
      </div>
    `;
    
    if (weatherBox) weatherBox.innerHTML = errorMessage;
    if (forecastBox) forecastBox.innerHTML = "";
    if (newsBox) newsBox.innerHTML = "";
  }
}

// ===== EVENT LISTENERS =====

// ===== APP INITIALIZATION =====

/**
 * Initialize the application with loading screen and setup
 */
document.addEventListener('DOMContentLoaded', function() {
  // Show loading screen
  initializeApp();
  
  // Setup event listeners
  setupEventListeners();
  
  // Initialize all sections with default content
  initializeDefaultContent();
  
  // Load quick comparison data
  loadQuickComparisonData();
  
  // Setup favorites from localStorage
  loadFavoriteCities();
  
  // Load default weather for Delhi after page loads (if main page is visible)
  setTimeout(() => {
    const mainPage = getElement('mainPage');
    if (mainPage && mainPage.style.display !== 'none') {
      // Only auto-load if user is on the main weather page
      loadDefaultCityWeather();
    }
  }, 1000);
});

/**
 * Initialize app with loading screen
 */
function initializeApp() {
  const loader = getElement('appLoader');
  
  if (loader) {
    // Simulate loading time for better UX
    setTimeout(() => {
      loader.classList.add('fade-out');
      setTimeout(() => {
        loader.style.display = 'none';
      }, 1000);
    }, 3000); // Show loader for 3 seconds
  }
}

/**
 * Initialize default content for all sections
 */
function initializeDefaultContent() {
  // Initialize weather result with welcome message
  const weatherBox = getElement("weatherResult");
  if (weatherBox) {
    weatherBox.innerHTML = `
      <div class="welcome-message">
        <div class="welcome-icon">🌦️</div>
        <h3>Welcome to WeatherIndia!</h3>
        <p>Search for any Indian city to get detailed weather information, forecasts, and air quality data.</p>
        <div class="sample-cities">
          <h4>Popular cities to try:</h4>
          <div class="city-suggestions">
            <button class="city-suggestion" onclick="searchCity('Delhi')">Delhi</button>
            <button class="city-suggestion" onclick="searchCity('Mumbai')">Mumbai</button>
            <button class="city-suggestion" onclick="searchCity('Bangalore')">Bangalore</button>
            <button class="city-suggestion" onclick="searchCity('Chennai')">Chennai</button>
          </div>
        </div>
      </div>
    `;
  }
  
  // Initialize forecast result
  const forecastBox = getElement("forecastResult");
  if (forecastBox) {
    forecastBox.innerHTML = `
      <div class="forecast-placeholder">
        <div class="placeholder-icon">📊</div>
        <h4>6-Hour Forecast</h4>
        <p>Detailed hourly forecast will appear here after you search for a city.</p>
      </div>
    `;
  }
  
  // Initialize news result with fallback content
  const newsBox = getElement("newsResult");
  if (newsBox) {
    newsBox.innerHTML = generateNewsHTML({ articles: [] }); // This will show fallback tips
  }
  
  // Initialize advanced weather details with placeholders
  initializeAdvancedDetails();
}

/**
 * Initialize advanced weather detail sections with meaningful placeholders
 */
function initializeAdvancedDetails() {
  const sunMoonElement = getElement('sunMoonData');
  if (sunMoonElement) {
    sunMoonElement.innerHTML = `
      <div class="sun-moon-placeholder">
        <p>🌅 Sunrise & sunset times will appear here after searching for a city</p>
      </div>
    `;
  }
  
  const uvElement = getElement('uvIndexData');
  if (uvElement) {
    uvElement.innerHTML = `
      <div class="uv-placeholder">
        <p>☀️ UV index data will appear here after searching for a city</p>
      </div>
    `;
  }
  
  const visibilityElement = getElement('visibilityData');
  if (visibilityElement) {
    visibilityElement.innerHTML = `
      <div class="visibility-placeholder">
        <p>👁️ Visibility data will appear here after searching for a city</p>
      </div>
    `;
  }
  
  const alertsElement = getElement('weatherAlerts');
  if (alertsElement) {
    alertsElement.innerHTML = `
      <div class="alerts-placeholder">
        <p>⚠️ Weather alerts will appear here if any conditions require attention</p>
      </div>
    `;
  }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Main page search
  const cityInput = getElement("cityInput");
  if (cityInput) {
    cityInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        getWeather();
      }
    });
  }
  
  // Overview page search
  const overviewCityInput = getElement("overviewCityInput");
  if (overviewCityInput) {
    overviewCityInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        getOverviewWeather();
      }
    });
  }
}

// ===== OVERVIEW PAGE FUNCTIONS =====

/**
 * Search for weather in overview page
 */
function searchOverviewCity(city) {
  const overviewCityInput = getElement("overviewCityInput");
  if (overviewCityInput) {
    overviewCityInput.value = city;
    getOverviewWeather();
  }
}

/**
 * Get weather data for overview page
 */
async function getOverviewWeather() {
  const cityInput = getElement("overviewCityInput");
  const city = cityInput?.value?.trim() || DEFAULT_CITY;
  
  const weatherBox = getElement("weatherResult");
  const forecastBox = getElement("forecastResult");
  const newsBox = getElement("newsResult");
  const aqiBox = getElement("aqiResult");
  const statsBox = getElement("weatherStats");
  
  if (!weatherBox || !forecastBox || !newsBox) {
    console.error("Required DOM elements not found");
    return;
  }

  // Show loading states
  weatherBox.innerHTML = '<div class="loading">🔄 Loading weather data...</div>';
  forecastBox.innerHTML = '<div class="loading">🔄 Loading forecast...</div>';
  newsBox.innerHTML = '<div class="loading">🔄 Loading news...</div>';
  if (aqiBox) aqiBox.innerHTML = '<div class="loading">🔄 Loading AQI...</div>';
  if (statsBox) statsBox.innerHTML = '<div class="loading">🔄 Loading stats...</div>';

  try {
    // Fetch all data concurrently
    const [weatherRes, forecastRes, newsRes] = await Promise.all([
      fetch(API_ENDPOINTS.weather(city)),
      fetch(API_ENDPOINTS.forecast(city)),
      fetch(API_ENDPOINTS.news)
    ]);

    // Check for API errors
    if (!weatherRes.ok) {
      throw new Error(`Weather API error: ${weatherRes.status}`);
    }
    if (!forecastRes.ok) {
      throw new Error(`Forecast API error: ${forecastRes.status}`);
    }

    // Parse JSON data
    const weatherData = await weatherRes.json();
    const forecastData = await forecastRes.json();
    const newsData = newsRes.ok ? await newsRes.json() : { articles: [] };

    // Fetch air quality data
    const { lat, lon } = weatherData.coord;
    const airRes = await fetch(API_ENDPOINTS.airPollution(lat, lon));
    const airData = airRes.ok ? await airRes.json() : null;
    
    // Process data
    const aqiInfo = processAirQualityData(airData);
    const greeting = getTimeBasedGreeting();
    const advice = getWeatherAdvice(weatherData.weather[0].main);
    
    // Update main weather display
    weatherBox.innerHTML = `
      <div class="overview-weather-display">
        <div class="weather-main-info">
          <div class="location-info">
            <h3>📍 ${weatherData.name}, ${weatherData.sys.country}</h3>
            <span class="greeting-text">${greeting}</span>
          </div>
          <div class="temperature-display">
            <img class="weather-icon-large" 
                 src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png" 
                 alt="${weatherData.weather[0].description}" />
            <div class="temp-info">
              <div class="main-temp">${weatherData.main.temp.toFixed(1)}°C</div>
              <div class="feels-like">Feels like ${weatherData.main.feels_like.toFixed(1)}°C</div>
            </div>
          </div>
          <div class="weather-description">
            <h4>${weatherData.weather[0].main}</h4>
            <p>${weatherData.weather[0].description}</p>
            <div class="weather-advice">💡 ${advice}</div>
          </div>
        </div>
        
        <div class="additional-info">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-icon">💧</span>
              <div class="info-details">
                <span class="info-label">Humidity</span>
                <span class="info-value">${weatherData.main.humidity}%</span>
              </div>
            </div>
            <div class="info-item">
              <span class="info-icon">🌬️</span>
              <div class="info-details">
                <span class="info-label">Wind Speed</span>
                <span class="info-value">${weatherData.wind.speed} m/s</span>
              </div>
            </div>
            <div class="info-item">
              <span class="info-icon">☁️</span>
              <div class="info-details">
                <span class="info-label">Cloudiness</span>
                <span class="info-value">${weatherData.clouds.all}%</span>
              </div>
            </div>
            <div class="info-item">
              <span class="info-icon">🌡️</span>
              <div class="info-details">
                <span class="info-label">Pressure</span>
                <span class="info-value">${weatherData.main.pressure} hPa</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Update AQI display
    if (aqiBox) {
      aqiBox.innerHTML = `
        <div class="aqi-display">
          <div class="aqi-main">
            <div class="aqi-value" style="color: ${aqiInfo.aqiColor}">
              ${aqiInfo.aqi}
            </div>
            <div class="aqi-label">
              <div class="aqi-status" style="color: ${aqiInfo.aqiColor}">${aqiInfo.aqiText}</div>
              <div class="aqi-subtitle">Air Quality Index</div>
            </div>
          </div>
          <div class="aqi-details">
            <div class="pollutant">
              <span class="pollutant-name">PM2.5</span>
              <span class="pollutant-value">${aqiInfo.pm25} µg/m³</span>
            </div>
            <div class="pollutant">
              <span class="pollutant-name">PM10</span>
              <span class="pollutant-value">${aqiInfo.pm10} µg/m³</span>
            </div>
          </div>
        </div>
      `;
    }
    
    // Update stats display
    if (statsBox) {
      statsBox.innerHTML = `
        <div class="stat-item">
          <span class="stat-icon">🌡️</span>
          <span class="stat-label">Temperature</span>
          <span class="stat-value">${weatherData.main.temp.toFixed(1)}°C</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">💧</span>
          <span class="stat-label">Humidity</span>
          <span class="stat-value">${weatherData.main.humidity}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">🌬️</span>
          <span class="stat-label">Wind Speed</span>
          <span class="stat-value">${weatherData.wind.speed} m/s</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">☁️</span>
          <span class="stat-label">Cloudiness</span>
          <span class="stat-value">${weatherData.clouds.all}%</span>
        </div>
      `;
    }

    // Update forecast display
    forecastBox.innerHTML = generateForecastHTML(forecastData);
    
    // Update news display
    newsBox.innerHTML = generateNewsHTML(newsData);
    
    // Control animations and background
    controlWeatherAnimations(weatherData.weather[0].main, weatherData.wind.speed, weatherData);
    
    // Clear input
    if (cityInput) cityInput.value = "";
    
  } catch (error) {
    console.error("Error fetching overview weather data:", error);
    
    const errorMessage = `
      <div class="error-message">
        <h3>❌ Unable to fetch weather data</h3>
        <p>Please check your internet connection and try again.</p>
        <p>Make sure you entered a valid Indian city name.</p>
        <button onclick="getOverviewWeather()" class="retry-btn">Try Again</button>
      </div>
    `;
    
    if (weatherBox) weatherBox.innerHTML = errorMessage;
    if (forecastBox) forecastBox.innerHTML = "";
    if (newsBox) newsBox.innerHTML = "";
    if (aqiBox) aqiBox.innerHTML = '<div class="aqi-placeholder"><div class="aqi-icon">🍃</div><p>Unable to load AQI data</p></div>';
    if (statsBox) statsBox.innerHTML = '<div class="stats-placeholder"><p>Unable to load statistics</p></div>';
  }
}

/**
 * Load default weather data on page load
 */
function loadDefaultWeather() {
  // This function can be called to refresh data
  const currentPath = window.location.pathname;
  if (currentPath.includes('weather.html')) {
    console.log('Refreshing overview data...');
  }
}

/**
 * Load default city weather when app starts
 */
function loadDefaultCityWeather() {
  const cityInput = getElement('cityInput');
  if (cityInput) {
    cityInput.value = DEFAULT_CITY;
    // Show a subtle indication that we're loading default data
    const weatherBox = getElement('weatherResult');
    if (weatherBox) {
      weatherBox.innerHTML = `
        <div class="auto-loading">
          <div class="loading-icon">🔄</div>
          <h4>Loading weather for ${DEFAULT_CITY}...</h4>
          <p>Getting you started with current weather data</p>
        </div>
      `;
    }
    // Load weather after a short delay
    setTimeout(() => {
      getWeather();
    }, 500);
  }
}

// ===== ADVANCED FEATURES =====

/**
 * Load quick comparison data for major cities
 */
async function loadQuickComparisonData() {
  const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai'];
  
  for (const city of cities) {
    try {
      const response = await fetch(API_ENDPOINTS.weather(city));
      if (response.ok) {
        const data = await response.json();
        const tempElement = getElement(`${city.toLowerCase()}QuickTemp`);
        if (tempElement) {
          tempElement.textContent = `${Math.round(data.main.temp)}°C`;
          tempElement.style.color = getTemperatureColor(data.main.temp);
        }
      } else {
        // Handle API error gracefully
        const tempElement = getElement(`${city.toLowerCase()}QuickTemp`);
        if (tempElement) {
          tempElement.textContent = 'N/A';
          tempElement.style.color = '#666';
        }
      }
    } catch (error) {
      console.error(`Error loading quick temp for ${city}:`, error);
      // Show fallback content
      const tempElement = getElement(`${city.toLowerCase()}QuickTemp`);
      if (tempElement) {
        tempElement.textContent = 'N/A';
        tempElement.style.color = '#666';
      }
    }
  }
}

/**
 * Get color based on temperature
 * @param {number} temp - Temperature in Celsius
 * @returns {string} - CSS color value
 */
function getTemperatureColor(temp) {
  if (temp <= 10) return '#3b82f6'; // Blue - Cold
  if (temp <= 20) return '#10b981'; // Green - Cool
  if (temp <= 30) return '#f59e0b'; // Orange - Warm
  return '#ef4444'; // Red - Hot
}

/**
 * Quick compare city functionality
 * @param {string} city - City name to compare
 */
function quickCompareCity(city) {
  const cityInput = getElement("cityInput");
  if (cityInput) {
    cityInput.value = city;
    getWeather();
    
    // Scroll to results
    setTimeout(() => {
      const weatherResult = getElement('weatherResult');
      if (weatherResult) {
        weatherResult.scrollIntoView({ behavior: 'smooth' });
      }
    }, 500);
  }
}

/**
 * Open comparison modal (placeholder for future feature)
 */
function openComparisonModal() {
  alert('🎆 Advanced city comparison feature coming soon!\n\nFor now, use the quick compare buttons to switch between cities.');
}

// ===== FAVORITES SYSTEM =====

let favoriteCities = [];

/**
 * Load favorite cities from localStorage
 */
function loadFavoriteCities() {
  const stored = localStorage.getItem('weatherApp_favorites');
  if (stored) {
    favoriteCities = JSON.parse(stored);
    displayFavoriteCities();
  }
}

/**
 * Save favorite cities to localStorage
 */
function saveFavoriteCities() {
  localStorage.setItem('weatherApp_favorites', JSON.stringify(favoriteCities));
}

/**
 * Add city to favorites
 * @param {string} cityName - Name of the city
 * @param {Object} weatherData - Weather data object
 */
function addToFavorites(cityName, weatherData) {
  const existing = favoriteCities.find(city => city.name.toLowerCase() === cityName.toLowerCase());
  if (existing) {
    existing.lastUpdated = new Date().toISOString();
    existing.temp = weatherData.main.temp;
    existing.condition = weatherData.weather[0].main;
  } else {
    favoriteCities.push({
      name: cityName,
      temp: weatherData.main.temp,
      condition: weatherData.weather[0].main,
      icon: weatherData.weather[0].icon,
      lastUpdated: new Date().toISOString()
    });
  }
  
  saveFavoriteCities();
  displayFavoriteCities();
  
  // Show success message
  showNotification(`❤️ ${cityName} added to favorites!`);
}

/**
 * Remove city from favorites
 * @param {string} cityName - Name of the city to remove
 */
function removeFromFavorites(cityName) {
  favoriteCities = favoriteCities.filter(city => city.name.toLowerCase() !== cityName.toLowerCase());
  saveFavoriteCities();
  displayFavoriteCities();
  showNotification(`Removed ${cityName} from favorites`);
}

/**
 * Display favorite cities
 */
function displayFavoriteCities() {
  const favoritesContainer = getElement('favoriteCities');
  if (!favoritesContainer) return;
  
  if (favoriteCities.length === 0) {
    favoritesContainer.innerHTML = `
      <div class="favorites-placeholder">
        <p>Add cities to your favorites by searching for them!</p>
        <button class="add-favorite-btn" onclick="showFavoriteHelper()">
          + Add Favorite
        </button>
      </div>
    `;
    return;
  }
  
  const favoritesHTML = favoriteCities.map(city => `
    <div class="favorite-item">
      <div class="favorite-info" onclick="searchCity('${city.name}')">
        <img src="https://openweathermap.org/img/wn/${city.icon}.png" alt="${city.condition}" class="favorite-icon">
        <div class="favorite-details">
          <span class="favorite-name">${city.name}</span>
          <span class="favorite-temp">${Math.round(city.temp)}°C</span>
        </div>
      </div>
      <button class="remove-favorite" onclick="removeFromFavorites('${city.name}')" title="Remove from favorites">
        ×
      </button>
    </div>
  `).join('');
  
  favoritesContainer.innerHTML = favoritesHTML;
}

/**
 * Show favorite helper
 */
function showFavoriteHelper() {
  const message = `To add a city to favorites:\n
1. Search for any Indian city\n2. Wait for weather data to load\n3. Look for the ❤️ "Add to Favorites" button\n4. Click it to save the city!`;
  alert(message);
}

// ===== SHARING FUNCTIONALITY =====

let currentWeatherData = null;

/**
 * Share weather data
 */
function shareWeatherData() {
  if (!currentWeatherData) {
    showNotification('No weather data to share. Search for a city first!');
    return;
  }
  
  const shareText = `🌦️ Weather in ${currentWeatherData.name}:\n🌡️ ${Math.round(currentWeatherData.main.temp)}°C - ${currentWeatherData.weather[0].description}\n💧 Humidity: ${currentWeatherData.main.humidity}%\n🌬️ Wind: ${currentWeatherData.wind.speed} m/s\n\nPowered by WeatherIndia 🇮🇳`;
  
  if (navigator.share) {
    navigator.share({
      title: 'Weather Update',
      text: shareText,
      url: window.location.href
    }).catch(err => console.log('Error sharing:', err));
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(shareText).then(() => {
      showNotification('Weather data copied to clipboard!');
    }).catch(err => {
      console.log('Error copying:', err);
      fallbackShare(shareText);
    });
  } else {
    fallbackShare(shareText);
  }
}

/**
 * Fallback share method
 * @param {string} text - Text to share
 */
function fallbackShare(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  
  try {
    document.execCommand('copy');
    showNotification('Weather data copied to clipboard!');
  } catch (err) {
    console.log('Fallback copy failed:', err);
    // Show the text in an alert as last resort
    alert('Share this weather data:\n\n' + text);
  }
  
  document.body.removeChild(textArea);
}

// ===== NOTIFICATION SYSTEM =====

/**
 * Show notification to user
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (success, error, info)
 */
function showNotification(message, type = 'success') {
  // Remove existing notification
  const existing = document.querySelector('.notification');
  if (existing) {
    existing.remove();
  }
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <span class="notification-message">${message}</span>
    <button class="notification-close" onclick="this.parentElement.remove()">×</button>
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// ===== ENHANCED WEATHER FUNCTIONS =====

/**
 * Generate enhanced weather HTML with advanced features
 * @param {Object} weatherData - Weather data from API
 * @param {Object} aqiInfo - Processed air quality information
 * @returns {string} - HTML string for weather display
 */
function generateEnhancedWeatherHTML(weatherData, aqiInfo) {
  // Store current weather data for sharing
  currentWeatherData = weatherData;
  
  const greeting = getTimeBasedGreeting();
  const advice = getWeatherAdvice(weatherData.weather[0].main);
  
  // Check if city is in favorites
  const isFavorite = favoriteCities.some(city => city.name.toLowerCase() === weatherData.name.toLowerCase());
  
  // Enable share button
  setTimeout(() => {
    const shareBtn = getElement('shareWeatherBtn');
    if (shareBtn) {
      shareBtn.disabled = false;
    }
  }, 100);
  
  return `
    <div class="enhanced-weather-box">
      <div class="weather-header-section">
        <div class="greeting">${greeting}</div>
        <div class="location-section">
          <h3>📍 ${weatherData.name}, ${weatherData.sys.country}</h3>
          <button class="favorite-toggle ${isFavorite ? 'favorited' : ''}" 
                  onclick="${isFavorite ? `removeFromFavorites('${weatherData.name}')` : `addToFavorites('${weatherData.name}', currentWeatherData)`}">
            ${isFavorite ? '❤️ Remove from Favorites' : '♥️ Add to Favorites'}
          </button>
        </div>
      </div>
      
      <div class="weather-main-display">
        <div class="weather-visual">
          <img class="weather-icon-enhanced" 
               src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png" 
               alt="${weatherData.weather[0].description}" />
          <div class="temp-section">
            <div class="main-temp-enhanced">${weatherData.main.temp.toFixed(1)}°C</div>
            <div class="feels-like-enhanced">Feels like ${weatherData.main.feels_like.toFixed(1)}°C</div>
          </div>
        </div>
        
        <div class="weather-info">
          <h4 class="weather-condition">${weatherData.weather[0].main}</h4>
          <p class="weather-description">${weatherData.weather[0].description}</p>
          <div class="weather-advice-enhanced">💡 ${advice}</div>
        </div>
      </div>
      
      <div class="weather-metrics-grid">
        <div class="metric-item">
          <span class="metric-icon">💧</span>
          <div class="metric-details">
            <span class="metric-label">Humidity</span>
            <span class="metric-value">${weatherData.main.humidity}%</span>
          </div>
        </div>
        <div class="metric-item">
          <span class="metric-icon">🌬️</span>
          <div class="metric-details">
            <span class="metric-label">Wind Speed</span>
            <span class="metric-value">${weatherData.wind.speed} m/s</span>
          </div>
        </div>
        <div class="metric-item">
          <span class="metric-icon">☁️</span>
          <div class="metric-details">
            <span class="metric-label">Cloudiness</span>
            <span class="metric-value">${weatherData.clouds.all}%</span>
          </div>
        </div>
        <div class="metric-item">
          <span class="metric-icon">🌡️</span>
          <div class="metric-details">
            <span class="metric-label">Pressure</span>
            <span class="metric-value">${weatherData.main.pressure} hPa</span>
          </div>
        </div>
      </div>
      
      <div class="aqi-section">
        <div class="aqi-header">
          <h4>🌫️ Air Quality Index</h4>
          <span class="aqi-value" style="color: ${aqiInfo.aqiColor}">${aqiInfo.aqi}</span>
        </div>
        <div class="aqi-status" style="color: ${aqiInfo.aqiColor}">${aqiInfo.aqiText}</div>
        <div class="aqi-details">
          <span>PM2.5: ${aqiInfo.pm25} µg/m³</span>
          <span>PM10: ${aqiInfo.pm10} µg/m³</span>
        </div>
      </div>
    </div>
  `;
}

// ===== UPDATE MAIN WEATHER FUNCTION =====

// Override the existing getWeather function to use enhanced features
const originalGetWeather = getWeather;

/**
 * Enhanced getWeather function with all advanced features
 */
getWeather = async function() {
  try {
    const cityInput = getElement("cityInput");
    const city = cityInput?.value?.trim() || DEFAULT_CITY;
    
    const weatherBox = getElement("weatherResult");
    const forecastBox = getElement("forecastResult");
    const newsBox = getElement("newsResult");
    
    if (!weatherBox || !forecastBox || !newsBox) {
      console.error("Required DOM elements not found");
      return;
    }

    // Show loading states
    weatherBox.innerHTML = '<div class="loading">🔄 Loading weather data...</div>';
    forecastBox.innerHTML = '<div class="loading">🔄 Loading forecast...</div>';
    newsBox.innerHTML = '<div class="loading">🔄 Loading news...</div>';
    
    // Update advanced weather details placeholders
    updateAdvancedWeatherPlaceholders();

    // Fetch all data concurrently
    const [weatherRes, forecastRes, newsRes] = await Promise.all([
      fetch(API_ENDPOINTS.weather(city)),
      fetch(API_ENDPOINTS.forecast(city)),
      fetch(API_ENDPOINTS.news)
    ]);

    if (!weatherRes.ok) throw new Error(`Weather API error: ${weatherRes.status}`);
    if (!forecastRes.ok) throw new Error(`Forecast API error: ${forecastRes.status}`);

    const weatherData = await weatherRes.json();
    const forecastData = await forecastRes.json();
    const newsData = newsRes.ok ? await newsRes.json() : { articles: [] };

    // Fetch air quality data
    const { lat, lon } = weatherData.coord;
    const airRes = await fetch(API_ENDPOINTS.airPollution(lat, lon));
    const airData = airRes.ok ? await airRes.json() : null;
    
    const aqiInfo = processAirQualityData(airData);
    
    // Update UI with enhanced display
    weatherBox.innerHTML = generateEnhancedWeatherHTML(weatherData, aqiInfo);
    forecastBox.innerHTML = generateForecastHTML(forecastData);
    newsBox.innerHTML = generateNewsHTML(newsData);
    
    // Update advanced weather details
    updateAdvancedWeatherDetails(weatherData, lat, lon);
    
    // Control animations and background
    controlWeatherAnimations(weatherData.weather[0].main, weatherData.wind.speed, weatherData);
    
    // Clear input and show success
    if (cityInput) cityInput.value = "";
    
    // Show success notification
    showNotification(`Weather data loaded for ${weatherData.name}!`);
    
  } catch (error) {
    console.error("Error fetching weather data:", error);
    handleWeatherError();
  }
};

/**
 * Update advanced weather details placeholders
 */
function updateAdvancedWeatherPlaceholders() {
  const placeholders = [
    { id: 'sunMoonData', content: '<div class="loading-small">🔄 Loading sun data...</div>' },
    { id: 'uvIndexData', content: '<div class="loading-small">🔄 Loading UV data...</div>' },
    { id: 'visibilityData', content: '<div class="loading-small">🔄 Loading visibility...</div>' },
    { id: 'weatherAlerts', content: '<div class="loading-small">🔄 Checking alerts...</div>' }
  ];
  
  placeholders.forEach(({ id, content }) => {
    const element = getElement(id);
    if (element) element.innerHTML = content;
  });
}

/**
 * Update advanced weather details
 * @param {Object} weatherData - Weather data from API
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 */
function updateAdvancedWeatherDetails(weatherData, lat, lon) {
  // Sun & Moon times
  updateSunMoonData(weatherData);
  
  // UV Index (simulated - would need additional API)
  updateUVIndexData(weatherData);
  
  // Visibility
  updateVisibilityData(weatherData);
  
  // Weather alerts (simulated)
  updateWeatherAlerts(weatherData);
}

/**
 * Update sun and moon data
 * @param {Object} weatherData - Weather data object
 */
function updateSunMoonData(weatherData) {
  const sunMoonElement = getElement('sunMoonData');
  if (!sunMoonElement) return;
  
  const sunrise = new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString('en-IN', { 
    hour: '2-digit', minute: '2-digit' 
  });
  const sunset = new Date(weatherData.sys.sunset * 1000).toLocaleTimeString('en-IN', { 
    hour: '2-digit', minute: '2-digit' 
  });
  
  sunMoonElement.innerHTML = `
    <div class="sun-moon-display">
      <div class="sun-time">
        <span class="sun-icon">🌅</span>
        <div class="time-info">
          <span class="time-label">Sunrise</span>
          <span class="time-value">${sunrise}</span>
        </div>
      </div>
      <div class="sun-time">
        <span class="sun-icon">🌇</span>
        <div class="time-info">
          <span class="time-label">Sunset</span>
          <span class="time-value">${sunset}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Update UV index data (simulated)
 * @param {Object} weatherData - Weather data object
 */
function updateUVIndexData(weatherData) {
  const uvElement = getElement('uvIndexData');
  if (!uvElement) return;
  
  // Simulate UV index based on weather conditions
  const now = new Date();
  const hour = now.getHours();
  let uvIndex = 0;
  
  if (hour >= 10 && hour <= 16) {
    if (weatherData.weather[0].main === 'Clear') uvIndex = 8;
    else if (weatherData.weather[0].main === 'Clouds') uvIndex = 5;
    else uvIndex = 3;
  } else if (hour >= 8 && hour <= 18) {
    uvIndex = 4;
  } else {
    uvIndex = 0;
  }
  
  const uvLevel = uvIndex <= 2 ? 'Low' : uvIndex <= 5 ? 'Moderate' : uvIndex <= 7 ? 'High' : 'Very High';
  const uvColor = uvIndex <= 2 ? '#10b981' : uvIndex <= 5 ? '#f59e0b' : uvIndex <= 7 ? '#ef4444' : '#7c2d12';
  
  uvElement.innerHTML = `
    <div class="uv-display">
      <div class="uv-value" style="color: ${uvColor}">${uvIndex}</div>
      <div class="uv-level" style="color: ${uvColor}">${uvLevel}</div>
      <div class="uv-advice">Use sunscreen if UV index > 3</div>
    </div>
  `;
}

/**
 * Update visibility data
 * @param {Object} weatherData - Weather data object
 */
function updateVisibilityData(weatherData) {
  const visibilityElement = getElement('visibilityData');
  if (!visibilityElement) return;
  
  const visibility = weatherData.visibility ? (weatherData.visibility / 1000).toFixed(1) : 'N/A';
  const visibilityStatus = weatherData.visibility >= 10000 ? 'Excellent' : 
                          weatherData.visibility >= 5000 ? 'Good' : 
                          weatherData.visibility >= 2000 ? 'Moderate' : 'Poor';
  
  visibilityElement.innerHTML = `
    <div class="visibility-display">
      <div class="visibility-value">${visibility} km</div>
      <div class="visibility-status">${visibilityStatus}</div>
    </div>
  `;
}

/**
 * Update weather alerts
 * @param {Object} weatherData - Weather data object
 */
function updateWeatherAlerts(weatherData) {
  const alertsElement = getElement('weatherAlerts');
  if (!alertsElement) return;
  
  const alerts = [];
  
  // Generate alerts based on conditions
  if (weatherData.main.temp > 40) {
    alerts.push({ type: 'heat', message: 'Extreme heat warning - Stay hydrated!' });
  }
  if (weatherData.main.humidity > 85) {
    alerts.push({ type: 'humidity', message: 'High humidity - Thunderstorms possible' });
  }
  if (weatherData.wind.speed > 10) {
    alerts.push({ type: 'wind', message: 'Strong winds - Be cautious outdoors' });
  }
  if (weatherData.weather[0].main === 'Rain') {
    alerts.push({ type: 'rain', message: 'Rain expected - Carry umbrella' });
  }
  
  if (alerts.length === 0) {
    alertsElement.innerHTML = `
      <div class="no-alerts">
        <div class="alert-icon">✅</div>
        <div class="alert-message">No weather alerts</div>
      </div>
    `;
  } else {
    const alertsHTML = alerts.map(alert => `
      <div class="alert-item alert-${alert.type}">
        <span class="alert-dot"></span>
        <span class="alert-text">${alert.message}</span>
      </div>
    `).join('');
    
    alertsElement.innerHTML = `<div class="alerts-list">${alertsHTML}</div>`;
  }
}

/**
 * Handle weather errors
 */
function handleWeatherError() {
  const errorMessage = `
    <div class="error-message-enhanced">
      <div class="error-icon">❌</div>
      <h3>Unable to fetch weather data</h3>
      <p>Please check your internet connection and try again.</p>
      <p>Make sure you entered a valid Indian city name.</p>
      <div class="error-actions">
        <button onclick="getWeather()" class="retry-btn-enhanced">Try Again</button>
        <button onclick="showMainPage()" class="back-btn-enhanced">Go Back</button>
      </div>
    </div>
  `;
  
  const weatherBox = getElement("weatherResult");
  const forecastBox = getElement("forecastResult");
  const newsBox = getElement("newsResult");
  
  if (weatherBox) weatherBox.innerHTML = errorMessage;
  if (forecastBox) forecastBox.innerHTML = "";
  if (newsBox) newsBox.innerHTML = "";
  
  showNotification('Failed to load weather data. Please try again.', 'error');
}
