function getWeatherIcon(weatherCode) {
    const iconMap = {
        1000: "fa-sun",
        1100: "fa-sun",
        1101: "fa-cloud-sun",
        1102: "fa-cloud-sun",
        1001: "fa-cloud",
        2000: "fa-smog",
        4000: "fa-cloud-rain",
        4001: "fa-cloud-showers-heavy",
        4200: "fa-cloud-rain",
        4201: "fa-cloud-showers-heavy",
        5000: "fa-snowflake",
        5001: "fa-snowflake",
        5100: "fa-snowflake",
        5101: "fa-snowflake",
        6000: "fa-icicles",
        6001: "fa-icicles",
        6200: "fa-icicles",
        6201: "fa-icicles",
        7000: "fa-icicles",
        7101: "fa-icicles",
        7102: "fa-icicles",
        8000: "fa-bolt"
    };
    return iconMap[weatherCode] || "fa-question";
}

function displayWeather(data) {
    const weatherInfo = document.getElementById('weather-info');
    if (data.data && data.data.timelines && data.data.timelines[0].intervals.length > 0) {
        const currentWeather = data.data.timelines[0].intervals[0].values;
        const temperature = currentWeather.temperature;
        const weatherCode = currentWeather.weatherCode;
        const humidity = currentWeather.humidity;
        const windSpeed = currentWeather.windSpeed;
        const precipitationProbability = currentWeather.precipitationProbability;

        const weatherDescriptions = {
            1000: "Clear",
            1100: "Mostly Clear",
            1101: "Partly Cloudy",
            1102: "Mostly Cloudy",
            1001: "Cloudy",
            2000: "Fog",
            4000: "Drizzle",
            4001: "Rain",
            4200: "Light Rain",
            4201: "Heavy Rain",
            5000: "Snow",
            5001: "Flurries",
            5100: "Light Snow",
            5101: "Heavy Snow",
            6000: "Freezing Drizzle",
            6001: "Freezing Rain",
            6200: "Light Freezing Rain",
            6201: "Heavy Freezing Rain",
            7000: "Ice Pellets",
            7101: "Heavy Ice Pellets",
            7102: "Light Ice Pellets",
            8000: "Thunderstorm"
        };

        const weatherDescription = weatherDescriptions[weatherCode] || "Unknown";
        const weatherIcon = getWeatherIcon(weatherCode);

        weatherInfo.innerHTML = `
            <div class="weather-icon"><i class="fas ${weatherIcon}"></i></div>
            <h2>Current Weather</h2>
            <p><i class="fas fa-thermometer-half"></i> Temperature: ${temperature.toFixed(1)}°C</p>
            <p><i class="fas fa-cloud"></i> Conditions: ${weatherDescription}</p>
            <p><i class="fas fa-tint"></i> Humidity: ${humidity.toFixed(1)}%</p>
            <p><i class="fas fa-wind"></i> Wind Speed: ${windSpeed.toFixed(1)} m/s</p>
            <p><i class="fas fa-umbrella"></i> Chance of Rain: ${precipitationProbability.toFixed(1)}%</p>
        `;
    } else {
        weatherInfo.innerHTML = '<p>Weather data not available</p>';
    }
}

function getWeather(lat, lon) {
    fetch(`/weather?lat=${lat}&lon=${lon}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => displayWeather(data))
        .catch(error => {
            console.error('Error:', error);
            alert(`Failed to fetch weather data: ${error.message}`);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    const getLocationBtn = document.getElementById('get-location');
    const searchLocationBtn = document.getElementById('search-location');
    const locationInput = document.getElementById('location-input');
    const inputGroup = document.querySelector('.input-group');

    getLocationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => getWeather(position.coords.latitude, position.coords.longitude),
                error => {
                    console.error('Geolocation error:', error);
                    alert(`Geolocation error: ${error.message}`);
                },
                { timeout: 10000, enableHighAccuracy: true }
            );
        } else {
            alert('Geolocation is not supported by your browser');
        }
    });

    searchLocationBtn.addEventListener('click', () => {
        inputGroup.style.display = inputGroup.style.display === 'none' ? 'flex' : 'none';
        if (inputGroup.style.display === 'flex') {
            locationInput.focus();
        }
    });

    locationInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            searchLocation();
        }
    });

    function searchLocation() {
        const location = locationInput.value;
        if (!location) {
            alert('Please enter a location');
            return;
        }
        fetch(`/geocode?location=${encodeURIComponent(location)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.results && data.results.length > 0) {
                    const { lat, lng } = data.results[0].geometry;
                    getWeather(lat, lng);
                } else {
                    throw new Error('Location not found');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert(`Error: ${error.message}`);
            });
    }
});

