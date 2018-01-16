var tripDestination;
var tripBegDate;
var tripEndDate;
var tripName;


$("#addTrip").on("click", function(event) {
  event.preventDefault();
  tripDestination = $("#inputDestination").val().trim();
  tripBegDate = $("#inputFromDate").val().trim();
  tripEndDate = $("#inputToDate").val().trim();
  localStorage.setItem("tripBegDate", tripBegDate);
  localStorage.setItem("tripEndDate", tripEndDate) ;
  doParams(tripDestination);
});

function doParams(){
  // using Axios to handle request and response
  // https://github.com/axios/axios
  axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
    params:{
      address:tripDestination,
      key:'AIzaSyAU9BlhAa-cE6usvMa4_Yme-N1majJDIys'
    }
  })
  .then(function(response){
    console.log(response);
    // store locaton data in local storage for use by maps page
    localStorage.setItem("tripLoc", response.data.results[0].formatted_address);
    localStorage.setItem("tripLat", response.data.results[0].geometry.location.lat);
    localStorage.setItem("tripLng", response.data.results[0].geometry.location.lng);
    localStorage.setItem("tripPid", response.data.results[0].place_id);
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
