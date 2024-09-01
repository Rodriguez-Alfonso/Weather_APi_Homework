// Input field for city name
const city = document.getElementById("enter-city"); 
//  Search button
const search = document.querySelector("#search-form button"); 
// Element to display city name
const name = document.getElementById("city-name"); 
//  Element to display current weather icon
const currentPic = document.getElementById("current-pic"); 
//  Element to display current temperature
const currentTemp = document.getElementById("temperature"); 
//  Element to display current humidity
const currentHumidity = document.getElementById("humidity"); 
//  Element to display current wind speed
const currentWind = document.getElementById("wind-speed"); 
//  Element to display current UV index
const currentUV = document.getElementById("UV-index"); 
//  Element to display history
const history = document.getElementById("history"); 
//   Element to display 5-day forecast
var fiveday = document.getElementById("fiveday-header"); 
//  Element to display today's weather
var todayweather = document.getElementById("today-weather"); 
//  Element to display forecast
var forecast = document.getElementById("forecast"); 
//  
var searchHistory = JSON.parse(localStorage.getItem("search")) || []; 

// API key
const APIKey = "4f2ae1711f176486197a02ae511b3c70";

// Function to get weather data
function getWeather(cityName) {
    // API URL
    let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${APIKey}`;
    
    // Fetch request
    fetch(queryURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // Display city name
            name.innerHTML = `${data.name} (${new Date().toLocaleDateString()})`;
            // Display weather icon
            let weatherPic = data.weather[0].icon;
            currentPic.setAttribute(
                "src",
                `https://openweathermap.org/img/w/${weatherPic}.png`
            );
            currentPic.setAttribute("alt", data.weather[0].description);
            // Display temperature
            currentTemp.innerHTML = `Temperature: ${k2f(data.main.temp)} °F`;
            // Display humidity
            currentHumidity.innerHTML = `Humidity: ${data.main.humidity}%`;
            // Display wind speed
            currentWind.innerHTML = `Wind Speed: ${data.wind.speed} MPH`;
        
            // UV Index URL
            let lat = data.coord.lat;
            let lon = data.coord.lon;
            let UVQueryURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${APIKey}`;
            
            fetch(UVQueryURL)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    currentUV.innerHTML = `UV Index: ${data.value}`;
                });

            // Fetch and display 5-day forecast
            getFiveDayForecast(cityName);
        });
}

// Function to get 5-day forecast data
function getFiveDayForecast(cityName) {
    let forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${APIKey}&units=metric`;

    fetch(forecastURL)
        .then(response => response.json())
        .then(data => {
            forecast.innerHTML = ''; // Clear previous forecast

            // Extract and format the next five days' data
            const days = data.list.filter((item, index) => index % 8 === 0).slice(0, 5).map(item => ({
                date: new Date(item.dt_txt).toLocaleDateString(),
                icon: item.weather[0].icon,
                temp: item.main.temp,
                humidity: item.main.humidity,
                wind: item.wind.speed
            }));

            // Generate and append forecast cards
            days.forEach(day => {
                forecast.innerHTML += createForecastCard(day);
            });
        });
}

// Function to create a forecast card
function createForecastCard(day) {
    return `
        <div class="col-md-2 forecast bg-dark text-white rounded">
            <h5>${day.date}</h5>
            <img src="http://openweathermap.org/img/wn/${day.icon}@2x.png" alt="Weather icon">
            <p>Temp: ${day.temp}°C</p>
            <p>Humidity: ${day.humidity}%</p>
            <p>Wind: ${day.wind} MPH</p>
        </div>
    `;
}



// Function to render search history
function renderSearchHistory() {
    history.innerHTML = "";
    for (let i = 0; i < searchHistory.length; i++) {
        let historyItem = document.createElement("input");
        historyItem.setAttribute("type", "text");
        historyItem.setAttribute("readonly", true);
        historyItem.setAttribute("class", "form-control bg-white mb-2");
        historyItem.setAttribute("value", searchHistory[i]);
        historyItem.addEventListener("click", function () {
            getWeather(historyItem.value);
        });
        history.appendChild(historyItem);
    }
}

// Event listener for search button
search.addEventListener("click", function (event) {
    event.preventDefault();
    const cityName = city.value;
    if (!searchHistory.includes(cityName)) {
        searchHistory.push(cityName);
        localStorage.setItem("search", JSON.stringify(searchHistory));
        renderSearchHistory();
    }    
    getWeather(cityName);
});

document.getElementById("clear-history").addEventListener("click", function () {
    searchHistory = [];
    renderSearchHistory();
});

// Render search history on page load
renderSearchHistory();

// Function to convert Kelvin to Fahrenheit
function k2f(K) {
    return ((K - 273.15) * 9) / 5 + 32;
}