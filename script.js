const apiKey = "386b95548d43bed40c14e671405ecba5";

        function showError(message) {
            const errorEl = document.getElementById("errorMessage");
            errorEl.textContent = message;
            errorEl.style.display = "block";
            setTimeout(() => errorEl.style.display = "none", 5000);
        }

        function getCustomIcon(description) {
            const d = description.toLowerCase();
            if (d.includes("облачно") && d.includes("дожд")) return "images/cloud_sun_rain.jpg";
            if (d.includes("ясно")) return "images/sunny.jpg";
            if (d.includes("облачно")) return "images/cloudy.jpg";
            if (d.includes("дожд")) return "images/rain.jpg";
            if (d.includes("гроза")) return "images/storm.jpg";
            if (d.includes("снег")) return "images/snow.jpg";
            if (d.includes("туман")) return "images/fog.jpg";
            return "images/default.jpg";
        }

        function displayWeather(data) {
            const temp = Math.round(data.main.temp);
            const description = data.weather[0].description;
            const icon = getCustomIcon(description);
            const name = data.name;

            document.getElementById("weather").innerHTML = `
                <img src="${icon}" alt="${description}" />
                <div><strong>${name}</strong><br>${description}, ${temp}°C</div>
            `;
        }

        function getWeather(city = null) {
            const input = document.getElementById("cityInput");
            const cityName = city || input.value.trim();
            const output = document.getElementById("weather");
            const errorEl = document.getElementById("errorMessage");

            errorEl.style.display = "none";
            output.innerHTML = "";

            if (!cityName) {
                showError("Пожалуйста, введите название города");
                return;
            }

            output.textContent = "Загрузка данных...";

            fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=metric&lang=ru`)
                .then(response => {
                    if (!response.ok) throw new Error("Город не найден. Проверьте название.");
                    return response.json();
                })
                .then(displayWeather)
                .catch(err => {
                    showError(err.message);
                    output.textContent = "";
                });
        }

        function detectLocation() {
            const services = [
                "https://get.geojs.io/v1/ip/geo.json",
                "https://ipapi.co/json/"
            ];

            const tryService = (index) => {
                fetch(services[index])
                    .then(res => res.json())
                    .then(data => {
                        const city = data.city || data.city_name;
                        if (city) {
                            document.getElementById("cityInput").value = city;
                            getWeather(city);
                        } else if (index < services.length - 1) {
                            tryService(index + 1);
                        } else {
                            showError("Не удалось определить город автоматически");
                        }
                    })
                    .catch(() => {
                        if (index < services.length - 1) {
                            tryService(index + 1);
                        } else {
                            showError("Сервис геолокации временно недоступен");
                        }
                    });
            };

            tryService(0);
        }

        document.addEventListener("DOMContentLoaded", detectLocation);
        document.getElementById("cityInput").addEventListener("keypress", function(e) {
            if (e.key === "Enter") getWeather();
        });