var tripDestination;
var tripBegDate;
var tripEndDate;
var tripName;

// setup the datepickers to be a date range
var today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
$('#inputFromDate').datepicker({
  uiLibrary: 'bootstrap4',
  // iconsLibrary: 'fontawesome',
  minDate: today,
  maxDate: function () {
    return $('#inputToDate').val();
  }
});
$('#inputToDate').datepicker({
  uiLibrary: 'bootstrap4',
  // iconsLibrary: 'fontawesome',
  minDate: function () {
    return $('#inputFromDate').val();
  }
});

$("#addTrip").on("click", function(event) {
  event.preventDefault();

  tripDestination = $("#inputDestination").val().trim();
  tripBegDate = $("#inputFromDate").val().trim();
  tripEndDate = $("#inputToDate").val().trim();
  localStorage.setItem("tripBegDate", tripBegDate);
  localStorage.setItem("tripEndDate", tripEndDate);
  doParams(tripDestination);
});

function doParams(){
  // get location data
  // using Axios to handle the Google Geocode request and response
  // https://github.com/axios/axios
  axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
    params:{
      address:tripDestination,
      key:'AIzaSyAU9BlhAa-cE6usvMa4_Yme-N1majJDIys'
    }
  })
  .then(function(response){
    console.log(response);
    // store locaton data in local storage for use by main.js and maps.js
    // localStorage.setItem("tripLoc", response.data.results[0].formatted_address);
    var tripLoc = response.data.results[0].address_components[0].short_name;
    localStorage.setItem("tripLoc", tripLoc);
    localStorage.setItem("tripLat", response.data.results[0].geometry.location.lat);
    localStorage.setItem("tripLng", response.data.results[0].geometry.location.lng);
    localStorage.setItem("tripPid", response.data.results[0].place_id);
    tripName = formatTripName(tripLoc, tripBegDate, tripEndDate);
    localStorage.setItem("tripName", tripName);
    // clear input fields
    $("#inputDestination").val("");
    $("#inputFromDate").val("");
    $("#inputToDate").val("");
    // change to maps page
    location.href = "main.html";
  })
  .catch(function(error){
    console.log(error);
  });
};

function formatTripName(trip, fromDate, toDate) {
  var name = trip;
  if (toDate) {
    name = name + " from " + fromDate + " to " + toDate;
  } else {
    name = name + " on " + fromDate;
  }
  return name;
}
