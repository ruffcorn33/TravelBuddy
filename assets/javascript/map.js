
// get trip values set welocome page in local storage
var tripAddress = localStorage.getItem("tripLoc");
var tripPid = localStorage.getItem("tripPid");
var tripLat = Number(localStorage.getItem("tripLat"));
var tripLng = Number(localStorage.getItem("tripLng"));
var tripFromDate = localStorage.getItem('tripBegDate')
var tripToDate = localStorage.getItem('tripEndDate')
// globals
var activity;
var map;
var infowindow;
var tripName = tripAddress;
var latLng = {lat:tripLat,lng:tripLng};
// suppress filling map with random markers in initMap
var buttonClick = false;
var request;
var service;
var markers=[];
var mapById = document.getElementById('map');
var tripName = formatTripName(tripAddress, tripFromDate, tripToDate);

// display trip name suggestion
$("#titleDisplay").text(tripName);

// event handler for actType button click
$(".activityButton").on("click", function(event){
  event.preventDefault();
  activity = $(this).attr("btnActivity");
  console.log(activity + " button clicked");
  buttonClick = true;
  initMap();
});

// MAP LOAD & RELOAD
// called on main.html load and when activity buttons are clicked
function initMap(){
  var options = {
    zoom:13,
    center:latLng
  }
  console.log("Loading map for: ");
  console.log(latLng);
  map = new google.maps.Map(mapById, options);

  // the buttonClick flag is set to false on page load to prevent markers
  // on map unless coming from an actType button click
  if (buttonClick){
    // setup paramters for Google Places request based on selected activity
    request = {
      location: latLng,
      radius: 3300,  //  about 2 miles
      type: [activity],
    };
    infowindow = new google.maps.InfoWindow();
    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);
    // add a listener to the map to detect rightclick.  This will recenter the
    // search area, clear existing markers and place
    google.maps.event.addListener(map, 'rightclick', function(event){
      map.setCenter(event.latlng);
      clearResults(markers);
      var request = {
        location: event.latLng,
        radius: 3300,
        type: [activity],
      };
      service.nearbySearch(request, callback);
    })
    // reset flag
    buttonClick = false;
  }
}

function callback(results, status) {
  if(status == google.maps.places.PlacesServiceStatus.OK){
    for (var i = 0; i < results.length; i++){
      markers.push(createMarker(results[i]));
      console.log(results[i]);
    }
  } else {
    console.log(google.maps.places.PlacesServiceStatus);
  }
}

function createMarker(place) {
  // place a marker on map
  var placeLoc = place.geometry.location;
  marker = new google.maps.Marker({
    position: place.geometry.location,
    map: map,
    title: place.name
  });
  // open infowindow when marker is clicked
  google.maps.event.addListener(marker, 'click', function(){
    var spanOpen = '<span style="color:red">';
    var btnStr = '<button id="addToList type="submit" class="btn btn-primary float-right">Add</button>';
    var rating = '';
    var price = '';
    openNow = '';
    if (place.rating) {
      rating = 'Rated: ' + place.rating;
    } else {
      rating = '';
    };

    if (place.price_level = 1) {price = '$'}
    else if (place.price_level = 2) {price = '$$'}
    else if (place.price_level = 3) {price = '$$$'}
    else if (place.price_level = 5) {price = '$$$$'}
    else {price = ''};

    if (place.opening_hours.open_now) {
      openNow = '  Open Now';
    } else {
      openNow = '';
    };

    var contentString = "<div class='container'><div id='heading'><h4>"+
      place.name +
      "</h4></div><div id='content'><h6>"+
      rating + '<h6> Price: ' + price +
      '</h6>' + spanOpen + openNow + '</span>'+
      "</h6>"+
      btnStr+
      "</div></div>";

    infowindow.setContent(contentString);
    infowindow.open(map, this);
  });
  return marker;
}

function clearResults(markers) {
  for (var m in markers) {
    markers[m].setMap(null);
  }
  markers = [];
}

function formatTripName(trip, fromDate, toDate) {
  var name = trip;
  if (toDate) {
    name = name + " from " + fromDate + " to " + toDate;
  } else {
    name = name + " on " + fromDate;
  }
  return name;
}
