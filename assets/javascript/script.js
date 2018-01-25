var tripDestination;
var tripBegDate;
var tripEndDate;
var tripName;

// these dates were originally intended to be used in the weather display
// but now are only used to format a suggested trip name
// setup the datepickers to be a date range
var today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
$('#inputFromDate').datepicker({
  uiLibrary: 'bootstrap4',
  iconsLibrary: 'fontawesome',
  minDate: today,
  maxDate: function () {
    return $('#inputToDate').val();
  }
});
$('#inputToDate').datepicker({
  uiLibrary: 'bootstrap4',
  iconsLibrary: 'fontawesome',
  minDate: function () {
    return $('#inputFromDate').val();
  }
});

$("#addTrip").on("click", function(event) {
  event.preventDefault();

  tripDestination = $("#inputDestination").val().trim();
  tripBegDate = $("#inputFromDate").val().trim();
  tripEndDate = $("#inputToDate").val().trim();
  // is this an update?
  var update = false;
  if ($(this).attr("update") === "true") {
    update = true;
    localStorage.setItem("update", "true");
  } else {
    localStorage.setItem("update", "false");
  }

  // validate the input
  // don't need to validate on an update
  if (update || (validateExists(tripDestination) && validateExists(tripBegDate))) {
    // input is validated, proceed

    // store values in localStorage
    if (validateExists(tripDestination)) {
      localStorage.setItem("tripDestination", tripDestination);
    } else if (update) {
      tripDestination = localStorage.getItem("tripDestination");
    }
    if (validateExists(tripBegDate)) {
      localStorage.setItem("tripBegDate", tripBegDate);
    } else if (update) {
      tripBegDate = localStorage.getItem("tripBegDate");
    }
    if (validateExists(tripEndDate)) {
      localStorage.setItem("tripEndDate", tripEndDate);
    } else if (update) {
      tripEndDate = localStorage.getItem("tripEndDate");
    }
    // continue with TravelBuddy
    doParams(tripDestination, tripBegDate, tripEndDate, update);
  } else {
    // input validation failed, popup the errors

    // get the modal
    var modal = document.getElementById('verificationModal');
// The OK button is ugly and unneccesary
    // get the <span> element that closes the modal
    // var span = document.getElementsByClassName("close")[0];
    // when the user clicks on <span> (OK), close the modal
    // span.onclick = function() {
    //   modal.style.display = "none";
    // }
    // when the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
    // make the modal say what it needs to say
    $('#verifyContent').empty();
    if (!validateExists(tripDestination)) {
      var p = $('<p style="color: red">');
      p.text("Must enter a Destination");
      $('#verifyContent').append(p);
    }
    if (!validateExists(tripBegDate)) {
      var p = $('<p style="color: red">');
      p.text("Must enter a Begin Date");
      $('#verifyContent').append(p);
    }
    // display the modal
    modal.style.display = "block";
  }
});

// validate that a variable exists and has a string length of at least 1 character
// return true if above is true, otherwise false
function validateExists(v)
{
  if ((typeof v == 'undefined') || v == null || (v.length <= 0))
  {
    return false;
  }
  return true;
}

function doParams(tripDestination, tripBegDate, tripEndDate, update){
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
    var tripLoc = "Your Trip";  // fail over default trip name
    // get city from reponse data to use in formatting a suggested trip name
    for (i=0; i<response.data.results[0].address_components.length; i++){
      if ((response.data.results[0].address_components[i].types[0] === 'locality')
          &&
          (response.data.results[0].address_components[i].types[1] === 'political')){
        tripLoc = response.data.results[0].address_components[i].short_name;
        continue;
      };
    };
    var tripLat = response.data.results[0].geometry.location.lat;
    var tripLng = response.data.results[0].geometry.location.lng;
    var tripPid = response.data.results[0].place_id;
    tripName = formatTripName(tripLoc, tripBegDate, tripEndDate);
    localStorage.setItem("tripLoc", tripLoc);
    localStorage.setItem("tripLat", tripLat);
    localStorage.setItem("tripLng", tripLng);
    localStorage.setItem("tripPid", tripPid);
    localStorage.setItem("tripName", tripName);
    // store in Firebase
    store_trip(tripName, {
        "location": tripDestination,
        "start_date": tripBegDate,
        "end_date": tripEndDate,
        "place_id": tripPid,
      }, update);
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

function toggleTripsNav() {
  var guestNav = $("#guest-trips");
  var userNav = $("#user-trips");
  guestNav.toggleClass("d-none d-block");
  userNav.toggleClass("d-none d-block");
  // if (guestNav.style.display == "block"){
  //   guestNav.style.display = "none";
  //   userNav.style.display = "block";
  // }
  // else {
  //   guestNav.style.display = "block";
  //   userNav.style.display = "none";
  // }
}
