// function trip() {
//
//   // event.preventDefault();
//   var APIKey = "2f34cea018b6436c4b7a13b8a8fe8bf2";
//
//   var city = localStorage.getItem("tripLoc");
//   var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + APIKey;
//
//   $.ajax({
//     url: queryURL,
//     method: "GET"
//   }).done(function(response) {
//     var tempMin = ((response.main.temp_min-273.15)*1.8)+32;
//     var tempMax = ((response.main.temp_max-273.15)*1.8)+32;
//     var tempMinRD = tempMin.toFixed(0);
//     var tempMaxRD = tempMax.toFixed(0);
//
//     $(".city").append(response.name);
//     $(".wind").append("Wind Speed: " + response.wind.speed);
//     $(".weather").append("Weather: " + response.weather[0].main);
//     $(".temp-min").append("Low Temp (fahrenheit): " + tempMinRD);
//     $(".temp-max").append("High Temp (fahrenheit): " + tempMaxRD);
//
//   });
// };
//
// trip();
