
// get trip values set welocome page in local storage
var tripAddress = localStorage.getItem("tripLoc");
var tripPid = localStorage.getItem("tripPid");
var tripLat = Number(localStorage.getItem("tripLat"));
var tripLng = Number(localStorage.getItem("tripLng"));
var tripFromDate = localStorage.getItem('tripBegDate')
var tripToDate = localStorage.getItem('tripEndDate')
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

function ActivityObj(place_id, name, lat, lng, category) {
  this.place_id = place_id;
  this.name = name;
  this.lat = lat;
  this.lng = lng;
  this.category = category;
}
//
// function CategoryObj(category, activityArray[]) {
//   this.category = category;
//   this.activityArray = activityArray[];
// }
//
//
// var test;
// for (i=0; i<ourCategories.length; i++){
//    test = new categoryObj(
//     ourCategories[i],
//     activityArray[]
//   );
// }

function fillCategoryList(p) {
  console.log(p.name);

}


// display trip name suggestion
$("#trip-name").attr("placeholder", "Suggestion: "+tripName);
// get user input for trip name
$('#saveTrip').on('click', function(){
  tripName = $("#trip-name").val().trim();
  $("#trip-name").attr(tripName);
});

// event handler for actType button click
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
  }
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
    service.nearbySearch(request, callback);
    // add a listener to the map to detect rightclick.  This will recenter the
    // search area, clear existing markers and place
    google.maps.event.addListener(map, 'rightclick', function(event){
      map.setCenter(event.latlng);
      clearResults(markers);
      var request = {
        location: event.latLng,
        radius: 3300,
        type: [category],
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
  marker = new google.maps.Marker({
    position: place.geometry.location,
    map: map,
    title: place.name
  });
  // open infowindow when marker is clicked
  google.maps.event.addListener(marker, 'click', function(){
    var rating = '';
    var price = '';
    openNow = '';

    if (place.rating) {
      rating = 'Rated: ' + place.rating +"  ";
    } else {
      rating = '';
    };

    if (place.price_level === 1) {price = '$'}
    else if (place.price_level === 2) {price = '$$'}
    else if (place.price_level === 3) {price = '$$$'}
    else if (place.price_level === 5) {price = '$$$$'}
    else {price = ''};

    if (place.opening_hours.open_now) {
      openNow = '  Open Now';
    } else {
      openNow = '';
    };

    // build this marker's infowindow
    var contentString = ([
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
        "<div id='info-content'>",
          "<h6>",
            rating,
              price,
            '<span class="float-right" style="color:red">',
              openNow,
            "</span>",
          "</h6>",
          "<form id='iw-form'>",
            '<button id="addToList type="submit" class="btn btn-primary float-right">',
              "Add",
            '</button>',
          "</form>",
        "</div>",
      "</div>"
    ].join(''));
    // open infowindow for clicked marker
    infowindow.setContent(contentString);
    infowindow.open(map, this);
    // event listener for 'Add' button click on inforwindow
    google.maps.event.addListener(infowindow, 'domready', function(){
      $('#iw-form').submit(function(event){
        event.preventDefault();
        console.log(place.name + ' -Add- button clicked');

        //make initial unordered list element
        var ulID = category+'-list';
        if ($(listDiv).attr("list-started") == 'false') {
          $(listDiv).html("");
          //make initial unorderd list div
          var ulDiv = $("<ul id='#" + ulID + "'>");
          $(listDiv).append(ulDiv);
          $(listDiv).attr("list-started", 'true');
        };
        // for some reason, this listener event wants to cycle through all of the
        // clicked places instead of just the current one.  This is my kludgy
        // workaround.  ToDo: find out how to instead clear that list after adding an
        // activity.
        // var result = $.grep(savedActivities, function(arr){ return arr.place_id === place.place_id; });
        var result = $.grep(savedActivities, function(arr){ return arr.place_id === place.place_id; });
        if (result.length == 0) {
          var listItemContent = place.name;
          // append list item
          var listItem = "<li id='#" + place.place_id + "'>" + listItemContent + "</li>";
          $(ulID).append(listItem);
          var savedActivity = new ActivityObj(place.place_id, place.name, place.geometry.location.lat, place.geometry.location.lng, category);
          savedActivities.push(savedActivity);
        }
        else if (result.length == 1) {
        // access the foo property using result[0].foo
        } else {
          // multiple items found
        };
      });
    });

  });
  return marker;
}

function clearResults(markers) {
  for (var m in markers) {
    markers[m].setMap(null);
  }
  markers = [];
}
