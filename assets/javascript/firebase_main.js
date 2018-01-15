// firebase_main.js

//
// generally:
//  don't use .set() since set wipes out all data and replaces with what's passed in - unless you're setting a leaf node
//  use .update() because it replaces/adds as neccesary
//

//
// Global Scope
//

// setup the datepickers to be a date range
// TODO - this datepicker code needs to be moved to global scope of a 'main project' js file
var today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
$('#inp_start_date').datepicker({
  uiLibrary: 'bootstrap4',
  // iconsLibrary: 'fontawesome',
  minDate: today,
  maxDate: function () {
    return $('#inp_end_date').val();
  }
});
$('#inp_end_date').datepicker({
  uiLibrary: 'bootstrap4',
  // iconsLibrary: 'fontawesome',
  minDate: function () {
    return $('#inp_start_date').val();
  }
});

// array of activity categories stored in Firebase
var activityCategoriesArray = [];
// current user
var user = null;     // the whole JSON record
var user_uid = null; // the Firebase uid for this user
var user_ref = null; // the Firebase ref for this user
var user_trips_ref = null;  // the Firebase ref for this user's trips
var active_trip_ref = null; // the Firebase ref for active trip
var active_trip_name = "";  // the name of the active trip
var activities_ref = null;  // Firebase ref to this trip's activities object

// set activityCategoriesArray once at first load
// also build the html for the select (TODO - move this loop to appropriate function)
activity_categories_ref.orderByKey().once('value').then(function(snapshot)
{
  activityCategoriesArray = snapshot.val();
  console.log("Actvity Catagories:", activityCategoriesArray);
  // now build the html for the form
  for ( var i = 0; i < activityCategoriesArray.length; ++i)
  {
    var option = $('<option>' + activityCategoriesArray[i] + '</option>');
    $('#inp_activity_category').append(option);
  }
});

// TODO - use proper log in stuff - 'child_added' is used instead of 'value' to get only one user (for now)
users_ref.once('child_added').then(function(user_snap)
{
  user = user_snap.val();
  user_uid = user_snap.key;
  user_ref = firebase.database().ref('travel_buddy/users' + '/' + user_uid);
  user_trips_ref = firebase.database().ref('travel_buddy/users' + '/' + user_uid + '/trips');
  var trip_name = "";
  console.log(user, user_snap.key);
  console.log("user_trips_ref", user_trips_ref);
  login_user(user);

  // register trips listener for this user
  user_trips_ref.orderByChild("start_date").on("child_added", function(child)
  {
    var trip = child.val();
    // log child
    console.log("Trip:", trip);
    // build the table row
    var tr = $('<tr>'
              + '<td class="user_trip">' + child.key + '</td>'
              + '<td>' + trip.location + '</td>'
              + '<td>' + trip.start_date + '</td>'
              + '<td>' + trip.end_date + '</td>'
              );
    // Writes the saved value from firebase to our display
    $("#tripRows").append(tr);
  }, function(errorObject)
  { // Handles firebase failure if it occurs
    console.log("The read failed: " + errorObject.code);
  });

  // register on click event for submit_trip button - relative to this user
  $("#submit_trip").on("click", function(event)
  {
    event.preventDefault();
    // Capture User Inputs and store them into variables
    trip_name      = $("#inp_trip_name").val().trim();
    var location   = $("#inp_trip_location").val().trim();
    var start_date = $("#inp_start_date").val();
    var end_date   = $("#inp_end_date").val();
    // log data
    console.log("name: ", trip_name, "location: ", location, "start_date", start_date, "end_date", end_date);
    // get the Firebase ref for the current trip
    active_trip_ref = firebase.database().ref('travel_buddy/users' + '/' + user_uid + '/trips/' + trip_name);
    // store data
    // use set() because it is a NEW trip (use update() when editing trip so we don't lose activities)
    active_trip_ref.set(
    {
      "location" : location,
      "start_date" : start_date,
      "end_date" : end_date,
    });
    // clear form
    $("#inp_trip_name").val("");
    $("#inp_trip_location").val("");

    // clear activities
    $('#activityRows').empty();
    // set the active trip name
    active_trip_name = trip_name;
    // display the active trip name
    $('#activeTrip').text(active_trip_name);
    // get Firebase ref to this trip's activities object
    activities_ref = firebase.database().ref('travel_buddy/users' + '/' + user_uid + '/trips/' + trip_name + '/activities');
    // register the events for the submit activity UI
    register_activity_ui(trip_name);
    // enable the submit_activity button
    $('#submit_activity').prop("disabled", false);
  });
});

//
// Event Functions
//

// register on click event for trip name selection
$('#tripRows').on('click', 'td.user_trip', function()
{
  // get the trip name clicked on
  active_trip_name = $(this).text();
  // user is selecting active trip to display activities for
  console.log("trip clicked:", active_trip_name);
  // display the active trip name
  $('#activeTrip').text(active_trip_name);
  // get the Firebase ref for the current trip
  active_trip_ref = firebase.database().ref('travel_buddy/users' + '/' + user_uid + '/trips/' + active_trip_name);
  // get Firebase ref to this trip's activities object
  activities_ref = firebase.database().ref('travel_buddy/users' + '/' + user_uid + '/trips/' + active_trip_name + '/activities');
  // register the events for the submit activity UI
  register_activity_ui(active_trip_name);
  // enable the submit_activity button
  $('#submit_activity').prop("disabled", false);
});

//
// Utility Functions
//
function login_user(user)
{
  console.log("logging in:", user.name, user.email);
  // TODO - replace this placeholder code
  // build the table row
  var tr = $('<tr>'
            + '<td>' + user.name + '</td>'
            + '<td>' + user.email + '</td>'
            );
  // Writes the saved value from firebase to our display
  $("#userRow").append(tr);
}

function register_activity_ui(trip_name)
{  
  // register on click event for submit_activity button - relative to this user/trip
  $("#submit_activity").on("click", function(event)
  {
    event.preventDefault();
    // Capture User Inputs and store them into variables
    var category      = $("#inp_activity_category").val();
    var activity_name = $("#inp_activity_name").val().trim();
    var location      = $("#inp_activity_location").val().trim();
    // log data
    console.log("category: ", category, "name: ", activity_name, "location: ", location);
    // get Firebase ref for this activity
    var activity_ref = firebase.database().ref('travel_buddy/users' + '/' + user_uid + '/trips/' + trip_name + '/activities/' + activity_name);
    // store data
    // use set() because it is a leaf node
    activity_ref.set(
    {
      "category" : category,
      "location" : location,
    });
    // clear form
    $("#inp_activity_name").val("");
    $("#inp_activity_location").val("");
  });

  // register activity listener for this trip
  activities_ref.orderByChild("category").on("child_added", function(child)
  {
    display_activity(child.val(), child.key);
  }, function(errorObject)
  { // Handles firebase failure if it occurs
    console.log("The read failed: " + errorObject.code);
  });
}

function display_activity(activity, activity_name)
{
  // log activity
  console.log("Activity:", activity);
  // build the table row
  var tr = $('<tr>'
            + '<td>' + activity.category + '</td>'
            + '<td>' + activity_name + '</td>'
            + '<td>' + activity.location + '</td>'
            );
  // Writes the saved value from firebase to our display
  $("#activityRows").append(tr);
}
