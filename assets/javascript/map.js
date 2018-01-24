
// get trip values set welocome page in local storage
var tripDestination = localStorage.getItem("tripDestination");
var tripPid = localStorage.getItem("tripPid");
var tripLat = Number(localStorage.getItem("tripLat"));
var tripLng = Number(localStorage.getItem("tripLng"));
var tripFromDate = localStorage.getItem('tripBegDate');
var tripToDate = localStorage.getItem('tripEndDate');
var tripName = localStorage.getItem('tripName');
// globals
var category;
var map;
var infowindow;
var latLng = {lat:tripLat,lng:tripLng};
// suppress filling map with random markers in initMap
var buttonClick = false;
var request;
var service;
var markers=[];
var mapById = document.getElementById('map');
var ourCategories = ["cafe","restaurant","transit_station","bar","night_club","park","museum"];
// array to hold activities within Categories
var savedActivities = [];
var listDiv;
var inlist = false;
var userLatLng;
//getLocationHTML();

function ActivityObj(place_id, name, lat, lng, category) {
  this.place_id = place_id;
  this.name = name;
  this.lat = lat;
  this.lng = lng;
  this.category = category;
}

// display trip name suggestion
$("#trip-name").attr("placeholder", "Suggestion: "+tripName);
// get user input for trip name
$('#saveTrip').on('click', function(){
  tripName = $("#trip-name").val().trim();
  $("#trip-name").attr(tripName);
  // store in Firebase
  var trip =  {
      "location": localStorage.getItem("tripDestination"),
      "start_date": localStorage.getItem('tripBegDate'),
      "end_date": localStorage.getItem('tripEndDate'),
      "place_id": localStorage.getItem("tripPid"),
    }
  store_trip(tripName, trip, true); // is potentially an update - gotta remove the old name
  // now add the activities
  for (var i = 0; i < savedActivities.length; ++i) {
    store_activity(savedActivities[i].name, savedActivities[i], false);
  }
});

// event handler for category button click
$(".categoryButton").on("click", function(event){
  event.preventDefault();
  category = $(this).attr("btnCategory");
  console.log(category + " button clicked");
  buttonClick = true;
  listDiv ="."+category;
  initMap();
});

// MAP LOAD & RELOAD
// called on main.html load and when category buttons are clicked
function initMap(){
  var options = {
    zoom:14,
    center:latLng
  };
  console.log("Loading map for: ");
  console.log(latLng);
  map = new google.maps.Map(mapById, options);

  // the buttonClick flag is set to false on page load to prevent markers
  // on map unless coming from an actType button click
  if (buttonClick){
    // setup paramters for Google Places request based on selected category
    request = {
      location: latLng,
      radius: 5000,
      type: [category],
    };
    infowindow = new google.maps.InfoWindow();
    service = new google.maps.places.PlacesService(map);

    service.nearbySearch(request, doMarkers);
    // add a listener to the map to detect rightclick.  This will recenter the
    // search area, clear existing markers and place
    google.maps.event.addListener(map, 'rightclick', function(event, request){
      map.setCenter(event.latlng);
      clearResults(markers);
      var request = {
        location: event.latLng,
        radius: 5000,
        type: [category],
      };
      service.nearbySearch(request, doMarkers);
    });
    // reset flag
    buttonClick = false;
  }  // end of category button click handler
}  // end of initMap()

// loop through places in results from nearbySearch request
function doMarkers(results, status) {
  if(status == google.maps.places.PlacesServiceStatus.OK){
    for (var i = 0; i < results.length; i++){
      addMarkerWithTimeout(results[i], i*100);
      console.log(results[i]);
    }
  } else {
    console.log(google.maps.places.PlacesServiceStatus);
  }
}

// animate marker drop with bounce
// timer prevents all markers from dropping at once
function addMarkerWithTimeout(place, timeout) {
  window.setTimeout(function() {
    markers.push(createMarker(place));
    console.log(place);
  }, timeout);
}

// create a marker from a place in results from nearbySearch request
function createMarker(place) {
  // place a marker on map
  var iconPath = "assets/images/icons/" + category + "/marker_" + category + ".png";
  marker = new google.maps.Marker({
    position: place.geometry.location,
    map: map,
    animation: google.maps.Animation.DROP,
    title: place.name,
    icon: iconPath
  });
  // open infowindow when marker is clicked
  google.maps.event.addListener(marker, 'click', function(){

    // prepare information to display in infowindow
    var rating = '';
    var price = '';
    openNow = '';

    // if rating exists, format it for display
    if (place.rating) {
      rating = 'Rated: ' + place.rating +"  ";
    } else {
      rating = '';
    };

    // if price_level exists, format it for display
    if (place.price_level) {
      if (place.price_level === 1) {price = '$'}
      else if (place.price_level === 2) {price = '$$'}
      else if (place.price_level === 3) {price = '$$$'}
      else if (place.price_level === 5) {price = '$$$$'}
      else {price = ''}
    };

    // if opening_hours exists, format for display
    if (place.opening_hours) {
      if (place.opening_hours.open_now) {
        openNow = '  Open Now';
      } else {
        openNow = '';
      }
    };

    // build html for infowindow
    var contentString1 = ([
      "<div class='info-container'>",
        "<div id='heading'>",
          "<h4>",
            place.name,
          "</h4>",
          "<h6>",
            place.vicinity,
          "</h6>",
        "</div>",
        "<br>",
        "<div class='info-content'>",
          "<h6>",
            rating,
              price,
            '<span class="float-right" style="color:red">',
              openNow,
            "</span>",
          "</h6>",
          "<form id='",
          place.place_id,
          "'>",
    ].join(''));

    var contentString2;
    var alreadyAdded = savedActivities.filter(obj => obj.name === this.title);
    if (alreadyAdded.length == 0) {
      contentString2 = ([
        '<button id="addActivityBtn" type="submit" class="btn btn-primary float-right">',
        "Add",
        '</button>',
        "</form>",
        "</div>",
        "</div>"
      ].join(''));
    } else{
      contentString2 = ([
        "</form>",
        "</div>",
        "</div>"
      ].join(''));
    }

    var contentString = contentString1+contentString2;

    // open infowindow for clicked marker
    infowindow.setContent(contentString);

    infowindow.open(map, this);
    // event listener for 'Add' button click on inforwindow
    google.maps.event.addListener(infowindow, 'domready', function(){
      var uniqueID = "#"+place.place_id;
      $(uniqueID).submit(function(event){
        event.preventDefault();
        console.log(place.name + ' -Add- button clicked');

        // make initial unordered list element
        // skip if already in html
        var ulID = category+'-list';
        if ($(listDiv).attr("list-started") == 'false') {
          $(listDiv).html("");
          //make initial unordered list div
          var ulElement = $("<ul id='" + ulID + "'>");
          $(listDiv).append(ulElement);
          $(listDiv).attr("list-started", 'true');
        };

        // NEW ACTIVITY
        // prepare an object to save in array
        var placeLat = place.geometry.location.lat();
        var placeLng = place.geometry.location.lng();
        var savedActivity = new ActivityObj(
          place.place_id,
          place.name,
          placeLat,
          placeLng,
          category
        );

        // check to see if this place is saved already
        // and prevent duplicates if it has been
        var matches = savedActivities.filter(obj => obj.place_id === place.place_id);
        if (matches.length == 0) {
          // save activity object to array
          savedActivities.push(savedActivity);
          // append list item
          var hashID = "#"+ulID;
          var liAndID = "<li id='" + place.place_id + "'>";
          $(hashID).prepend($(liAndID).text(place.name));
          $("#addActivityBtn").hide();
          // store in Firebase
          store_activity(savedActivity.name, savedActivity, false);
        }
        // handle if already in array (skip)
        else if (matches.length > 0) {
          console.log("That place is already in your list.")
        };  // end of 'add activity' code

      });  // end of $(uniqueID).submit(function(event)

    });  // end of 'Add' button event listener

  });  // end of marker click event to open infowindow

  return marker;
}  // end of createMarker()

function clearResults(markers) {
  for (var m in markers) {
    markers[m].setMap(null);
  }
  markers = [];
}

// get current location from HTML Geolocation API
function getLocationHTML() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getUserPosition);
  } else {
      console.log("Geolocation is not supported by this browser.");
  }
}

function getUserPosition(position) {
  userLatLng = {
    lat:position.coords.latitude,
    lng:position.coords.longitude
  };
}
