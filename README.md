# 🌦️ Indian Weather App

A modern, responsive weather application that provides real-time weather updates, forecasts, air quality information, and climate news for Indian cities.

![Weather App Banner](./assets/images/banner.png)

## ✨ Features

- **Real-time Weather Data**: Get current weather conditions for any Indian city
- **Hourly Forecast**: View weather predictions for the next few hours
- **Air Quality Index (AQI)**: Monitor air pollution levels with PM2.5 and PM10 data
- **Interactive Animations**: Dynamic weather-based animations (rain, wind, sunshine, clouds)
- **Climate News**: Latest weather and climate-related news from India
- **Time-based Greetings**: Personalized greetings based on time of day
- **Weather Advice**: Smart recommendations based on current conditions
- **Responsive Design**: Beautiful UI that works on all devices

## 🚀 Live Demo

[View Live Demo](https://your-demo-link.com) | [View Screenshots](#screenshots)

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **APIs**: 
  - OpenWeatherMap API (Weather & AQI data)
  - NewsAPI (Climate news)
- **Styling**: CSS Grid, Flexbox, CSS Animations
- **Fonts**: Google Fonts (Poppins, Lato)

## 📁 Project Structure

```
Weather App/
├── index.html              # Main landing page
├── weather.html            # Weather overview page  
├── script.js               # Main JavaScript logic
├── style.css               # Main stylesheet
├── assets/
│   ├── images/             # Screenshots and images
│   └── icons/              # App icons and favicon
├── netlify/
│   └── functions/          # Serverless functions
└── README.md               # Project documentation
```

## 🔧 Setup Instructions

### Prerequisites

- Modern web browser
- Internet connection
- API keys (see below)

### API Keys Required

1. **OpenWeatherMap API**
   - Visit [OpenWeatherMap](https://openweathermap.org/api)
   - Sign up for a free account
   - Get your API key

2. **NewsAPI**
   - Visit [NewsAPI](https://newsapi.org/)
   - Register for a free account
   - Get your API key

### Installation

1. **Clone or Download the repository**
   ```bash
   git clone https://github.com/your-username/indian-weather-app.git
   cd indian-weather-app
   ```

2. **Configure API Keys**
   - Open `script.js`
   - Replace the API key placeholders:
   ```javascript
   const WEATHER_API_KEY = "your_openweathermap_api_key_here";
   const NEWS_API_KEY = "your_newsapi_key_here";
   ```

3. **Run the Application**
   - Open `index.html` in your web browser
   - Or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   ```

## 🎯 How to Use

1. **Landing Page**: Start from the beautiful landing page with animations
2. **Search Weather**: Enter any Indian city name to get weather data
3. **View Details**: See current weather, forecast, and air quality information
4. **Read News**: Stay updated with latest climate news
5. **Weather Overview**: Use the dedicated overview page for detailed information

## 🖼️ Screenshots

<div align="center">

### Landing Page
![Landing Page](./assets/images/landing-page.png)

### Weather Results
![Weather Results](./assets/images/weather-results.png)

### Mobile View
![Mobile View](./assets/images/mobile-view.png)

</div>

## 🌟 Key Features Explained

### Weather Animations
- **Rain Animation**: Animated raindrops during rainy weather
- **Wind Effect**: Moving leaf emoji for windy conditions  
- **Sunshine**: Pulsing sun animation for clear weather
- **Clouds**: Moving cloud animation for cloudy conditions

### Air Quality Monitoring
- Real-time AQI levels (1-5 scale)
- PM2.5 and PM10 particle measurements
- Color-coded quality indicators
- Health advice based on pollution levels

### Smart Weather Advice
- Umbrella recommendations for rain
- Outdoor activity suggestions
- Time-appropriate greetings
- Context-aware weather tips

## 🎨 Design Features

- **Glassmorphism**: Modern frosted glass UI elements
- **Gradient Backgrounds**: Beautiful sky-inspired color schemes
- **Responsive Layout**: Seamless experience across all devices
- **Smooth Animations**: CSS transitions and keyframe animations
- **Typography**: Clean, readable fonts from Google Fonts

## 📱 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## 🔒 Security & Best Practices

- Client-side API key management
- CORS-friendly API requests
- Error handling and fallbacks
- Input validation and sanitization

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Dhruv Singh**
- GitHub: [@your-github-username](https://github.com/your-github-username)
- LinkedIn: [Your LinkedIn Profile](https://linkedin.com/in/your-profile)
- Email: your.email@example.com

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for weather data
- [NewsAPI](https://newsapi.org/) for news integration
- [Google Fonts](https://fonts.google.com/) for typography
- Weather icons from OpenWeatherMap

## 🚀 Future Enhancements

- [ ] Weather maps integration
- [ ] Historical weather data
- [ ] Weather alerts and notifications
- [ ] Multiple language support
- [ ] User preferences and settings
- [ ] Offline capability with PWA
- [ ] Weather widgets for websites

---

<div align="center">
  Made with ❤️ for weather enthusiasts in India
</div>