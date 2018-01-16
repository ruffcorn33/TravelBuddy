
// get trip values from local storage
var tripAddress = localStorage.getItem("tripLoc");
var tripPid = localStorage.getItem("tripPid");

$("#titleDisplay").text(tripAddress);

var mapById = document.getElementById('map');
function initMap(){
  var tripLat = Number(localStorage.getItem("tripLat"));
  var tripLng = Number(localStorage.getItem("tripLng"));
  var latLng = {
    lat:tripLat,
    lng:tripLng,
  };
  console.log(latLng);
  var options = {
    zoom:13,
    center:latLng
  }
  var map = new google.maps.Map(mapById, options);
}
