# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Stack: Static frontend (HTML/CSS/JavaScript) served locally; no build step required
- Primary pages: index.html (landing + main app), weather.html (overview dashboard)
- Entry script: script.js powers both pages; main.js is an alternative minimal demo not wired into the main pages
- External data: OpenWeatherMap (current weather, forecast, air pollution), newsdata.io for climate news
- Node engines (from package.json): node >= 14, npm >= 6

Common commands
- Install dependencies
  - npm install
- Start a live-reload dev server (localhost:3000)
  - npm run dev
- Preview as a static server in the current directory
  - npm start
- Build
  - npm run build
    - Note: This is a no-op for a static site
- Tests
  - No test runner is configured
- Deploy (Netlify)
  - npm run deploy
    - Requires Netlify CLI installed and authenticated (npm i -g netlify-cli && netlify login)

High-level architecture and code structure
- Pages and DOM contract
  - index.html defines two app surfaces:
    - Landing section (marketing/CTA) with animations
    - Main app section (search + dashboard) revealed via showMainPage()/showLandingPage() in script.js
  - weather.html is a dedicated “overview” page with its own search and dashboard layout
  - Both pages include script.js and rely on specific element IDs (e.g., cityInput, weatherResult, forecastResult, newsResult, sunMoonData, uvIndexData, visibilityData, weatherAlerts). If these IDs change in HTML, corresponding selectors in script.js must be updated
- script.js responsibilities (monolithic client app)
  - Configuration and endpoints
    - WEATHER_API_KEY constant and API_ENDPOINTS for OpenWeatherMap (weather, forecast, air_pollution) and newsdata.io
  - UI state and navigation
    - showMainPage()/showLandingPage() toggle major sections
    - resetWeatherBackground() clears weather-driven classes and animations
  - Weather-driven visuals
    - controlWeatherAnimations(weatherMain, windSpeed, weatherData) adds/removes body classes (e.g., weather-clear-day, weather-rain) and toggles animation elements defined in the pages (rain, wind, sunshine, cloudy, snow, thunderstorm)
    - style.css maps these classes to backgrounds/themes and contrast rules
  - Data fetch and processing
    - getWeather()/getOverviewWeather(): concurrency via Promise.all to fetch current weather, forecast, and news; also fetches air pollution by coordinates
    - processAirQualityData() normalizes AQI levels and PM values
    - Template generators produce HTML strings for weather, forecast, and news sections
  - Enhanced app flow
    - An enhanced getWeather overrides the original to render a richer UI (generateEnhancedWeatherHTML), update advanced details (sun/moon, UV, visibility, alerts), and show notifications
  - Initialization and UX
    - On DOMContentLoaded: initializeApp() (splash/loader), setupEventListeners(), initializeDefaultContent(), loadQuickComparisonData(), loadFavoriteCities(), optional auto-load for a default city
  - Favorites and sharing
    - Favorite cities persisted in localStorage; add/remove/update operations with UI rendering
    - Share functionality via Web Share API or clipboard fallback
  - Error handling and placeholders
    - Graceful fallbacks for API errors and “no data” cases; user-facing placeholders for dashboard sections
- main.js and styles.css (alternative minimal demo)
  - A lightweight geocode + current weather flow using Open-Meteo APIs with a simpler UI (not referenced by index.html/weather.html). Useful for isolated testing or prototyping

Notes pulled from repo documentation
- README.md lists prerequisites and shows where to set API keys (script.js). It also documents the two-page layout (index.html, weather.html), alternative ways to serve locally (e.g., Python http.server), and feature highlights

AI rules and additional project rules
- No CLAUDE.md, Cursor rules, or Copilot instruction files were detected
