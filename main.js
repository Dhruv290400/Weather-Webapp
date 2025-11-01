const form = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const message = document.getElementById('message');
const results = document.getElementById('results');
const locationName = document.getElementById('location-name');
const tempEl = document.getElementById('temp');
const windEl = document.getElementById('wind');
const timeEl = document.getElementById('time');

async function geocodeCity(name) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Geocoding request failed');
  const data = await res.json();
  if (!data.results || data.results.length === 0) throw new Error('Location not found');
  const r = data.results[0];
  return { lat: r.latitude, lon: r.longitude, display: `${r.name}${r.country ? ', ' + r.country : ''}` };
}

async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather request failed');
  const data = await res.json();
  if (!data.current_weather) throw new Error('No current weather available');
  return data.current_weather;
}

function setLoading(loading) {
  form.querySelector('button').disabled = loading;
  message.textContent = loading ? 'Loading…' : '';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;
  setLoading(true);
  results.classList.add('hidden');
  try {
    const { lat, lon, display } = await geocodeCity(city);
    const weather = await fetchWeather(lat, lon);
    locationName.textContent = display;
    tempEl.textContent = `${weather.temperature} °C`;
    windEl.textContent = `${weather.windspeed} km/h`;
    timeEl.textContent = new Date(weather.time).toLocaleString();
    results.classList.remove('hidden');
    message.textContent = '';
  } catch (err) {
    console.error(err);
    message.textContent = err.message || 'Something went wrong';
  } finally {
    setLoading(false);
  }
});
