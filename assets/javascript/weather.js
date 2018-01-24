function tripWeather() {

  // event.preventDefault();
  var APIKey = "2f34cea018b6436c4b7a13b8a8fe8bf2";

  var lat = localStorage.getItem("lat");
  console.log(lat);
  var lon = localStorage.getItem("lon");
  console.log(lon);
  var queryURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey;
 

  $.ajax({
    url: queryURL,
    method: "GET"
  }).done(function(response) {
    var tempMin = ((response.main.temp_min-273.15)*1.8)+32;
    var tempMax = ((response.main.temp_max-273.15)*1.8)+32;
    var tempMinRD = tempMin.toFixed(0);
    var tempMaxRD = tempMax.toFixed(0);
  
    $(".cityName").append(response.name);
    $(".windSpeed").append("Wind Speed: " + response.wind.speed);
    $(".forecast").append("Forecast: " + response.weather[0].main);
    $(".minTemp").append("Low Temp (fahrenheit): " + tempMinRD);
    $(".maxTemp").append("High Temp (fahrenheit): " + tempMaxRD);
  
  });
 };

 tripWeather();