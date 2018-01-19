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

// current user's JSON record
var user = null;
// the Firebase uid for this user
var user_uid = null;
// the name of the current trip
var current_trip_name = "";
// the name of the current trip
var current_activity_name = "";

// grab handle to the database 'travel_buddy' child - this ref is the root of the travel_buddy data
var travel_ref = firebase.database().ref("travel_buddy");
// grab handle to the 'users' child
var users_ref = firebase.database().ref("travel_buddy/users");
// grab handle to the 'activity_categories' child
var activity_categories_ref = firebase.database().ref("travel_buddy/activity_categories");
// the Firebase ref for the current user
var user_ref = null;
// the Firebase ref for the current user's trips
var user_trips_ref = null;
// Firebase ref to the current trip's activities object
var activities_ref = null;
// the Firebase ref for active trip
var active_trip_ref = null;

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
  user_ref = firebase.database().ref('travel_buddy/users/' + user_uid);
  user_trips_ref = firebase.database().ref('travel_buddy/users/' + user_uid + '/trips');
  var trip_name = "";
  console.log("User Key:", user_snap.key, "User:", user);
  login_user(user);

  // register trips listener for this user
  user_trips_ref.orderByChild("start_date").on("child_added", function(child)
  {
    var trip = child.val();
    // log child
    console.log("Trip Key:", child.key, "Trip:", trip);
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
    console.log("read trips failed: " + errorObject.code);
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
    current_trip_name = trip_name;
    // display the active trip name
    $('#activeTrip').text(current_trip_name);
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

// on click event for trip name selection
$('#tripRows').on('click', 'td.user_trip', function()
{
  // get the trip name clicked on
  current_trip_name = $(this).text();
  // user is selecting active trip to display activities for
  console.log("trip clicked:", current_trip_name);
  // display the active trip name
  $('#activeTrip').text(current_trip_name);
  // get the Firebase ref for the current trip
  active_trip_ref = firebase.database().ref('travel_buddy/users' + '/' + user_uid + '/trips/' + current_trip_name);
  // get Firebase ref to this trip's activities object
  activities_ref = firebase.database().ref('travel_buddy/users' + '/' + user_uid + '/trips/' + current_trip_name + '/activities');
  // register the events for the submit activity UI
  register_activity_ui(current_trip_name);
  // enable the submit_activity button
  $('#submit_activity').prop("disabled", false);
});

// on click event for the dump_user button
$('#dump_user').on('click', function()
{
  query_user().then(function(usr)
  {
    demo_JSON_dump(usr);
  })
});

// on click event for the dump_trip button
$('#dump_trip').on('click', function()
{
  query_trip().then(function(trip)
  {
    demo_JSON_dump(trip);
  })
});

// on click event for the dump_activity button
$('#dump_activity').on('click', function()
{
  query_activity().then(function(activity)
  {
    demo_JSON_dump(activity);
  })
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
    var category          = $("#inp_activity_category").val();
    current_activity_name = $("#inp_activity_name").val().trim();
    var location          = $("#inp_activity_location").val().trim();
    // log data
    console.log("category: ", category, "name: ", activity_name, "location: ", location);
    // get Firebase ref for this activity
    var activity_ref = firebase.database().ref('travel_buddy/users' + '/' + user_uid + '/trips/' + trip_name + '/activities/' + current_activity_name);
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
    console.log("read activities failed: " + errorObject.code);
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
  current_activity_name = activity_name;
}

// return a promise which returns the JSON object for the currently logged in user
function query_user()
{
  var deferred = $.Deferred(); // force synchronous 'cuz Firebase could be slow
  // TODO - when Auth is working for real, use the following line
  // var user = firebase.auth().currentUser;
  // TODO - but for now, with fake login, use the current global user_uid
  if ((typeof user_uid == 'undefined') || (user_uid.length <= 0))
  {
    console.log("query_user:  user_uid undefined or too short");
    deferred.reject({user_uid:"user_uid undefined or too short"});
    return deferred.promise();
  }
  users_ref.child(user_uid).once('value').then(function(user_snap)
  {
    // reset global user object
    user = user_snap.val();
    console.log("in query_trip:once, snap.val():", user)
    deferred.resolve(user);
  }, function(errorObject)
  { // Handles firebase failure if it occurs
    console.log("query_user failed: " + errorObject.code);
    deferred.reject(errorObject.code);
  });
  return deferred.promise();
}

// return a promise which returns the JSON object for the trip
// if nothing passed in for trip_name, use global current trip
function query_trip(trip_name)
{
  var deferred = $.Deferred(); // force synchronous 'cuz Firebase could be slow
  var trip;
  if ((typeof trip_name == 'undefined') || (trip_name.length <= 0))
  {
    if ((typeof current_trip_name == 'undefined') || (current_trip_name.length <= 0))
    {
      console.log("query_trip:  trip_name undefined or too short");
      deferred.reject({trip_name:"trip_name undefined or too short"});
      return deferred.promise();
    } else {
      trip_name = current_trip_name;
    }
  }
  
  user_trips_ref.child(trip_name).once('value').then(function(trip_snap)
  {
    trip = trip_snap.val();
    console.log("in query_trip:once, snap.val():", trip)
    deferred.resolve(trip);
  }, function(errorObject)
  { // Handles firebase failure if it occurs
    console.log("query_trip failed: " + errorObject.code);
    deferred.reject(errorObject.code);
  });
  return deferred.promise();
}

// return a promise which returns the JSON object for the trip
// if nothing passed in for activity_name, use global current trip
function query_activity(activity_name)
{
  var deferred = $.Deferred(); // force synchronous 'cuz Firebase could be slow
  var activity;
  if ((typeof activity_name == 'undefined') || (activity_name.length <= 0))
  {
    if ((typeof current_activity_name == 'undefined') || (current_activity_name.length <= 0))
    {
      console.log("query_activity:  activity_name undefined or too short");
      deferred.reject({activity_name:"activity_name undefined or too short"});
      return deferred.promise();
    } else {
      activity_name = current_activity_name;
    }
  }
  
  activities_ref.child(activity_name).once('value').then(function(activity_snap)
  {
    activity = activity_snap.val();
    console.log("in query_activity:once, snap.val():", activity)
    deferred.resolve(activity);
  }, function(errorObject)
  { // Handles firebase failure if it occurs
    console.log("query_activity failed: " + errorObject.code);
    deferred.reject(errorObject.code);
  });
  return deferred.promise();
}

// debug function to dump a JSON object
function demo_JSON_dump(obj)
{
  $('#firebase_dump').text(JSON.stringify(obj, null, 2));
}
