var tripDestination;
var tripBegDate;
var tripEndDate;
var tripName;

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
  // validate the input
  if (validateExists(tripDestination) && validateExists(tripBegDate)) {
    // input is validated, proceed
    localStorage.setItem("tripBegDate", tripBegDate);
    localStorage.setItem("tripEndDate", tripEndDate);
    doParams(tripDestination);
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
  if ((typeof v == 'undefined') || (v.length <= 0))
  {
    return false;
  }
  return true;
}

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
