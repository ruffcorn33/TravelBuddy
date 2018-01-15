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
var user_trips_ref = null; // the Firebase ref for this user's trips

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
  console.log(user, user_snap.key);
  console.log("user_trips_ref", user_trips_ref);
  login_user(user);

  // register listener for this user
  user_trips_ref.orderByChild("category").on("child_added", function(child)
  {
    var activity = child.val();
    // log child
    console.log("Activity:", activity);
    // build the table row
    var tr = $('<tr>'
              + '<td>' + activity.category + '</td>'
              + '<td>' + child.key + '</td>'
              + '<td>' + activity.location + '</td>'
              );
    // Writes the saved value from firebase to our display
    $("#activityRows").append(tr);
  }, function(errorObject)
  { // Handles firebase failure if it occurs
    console.log("The read failed: " + errorObject.code);
  });

  // register on click event for submit_trip button - relative to this user
  $("#submit_trip").on("click", function(event)
  {
    event.preventDefault();
    // Capture User Inputs and store them into variables
    var name       = $("#inp_trip_name").val().trim();
    var location   = $("#inp_trip_location").val().trim();
    var start_date = $("#inp_start_date").val().trim();
    var end_date   = $("#inp_end_date").val().trim();
    // log data
    console.log("category: ", category, "name: ", name, "location: ", location);
    // store data
    activity_ref = firebase.database().ref('travel_buddy/users' + '/' + user_uid + '/trips/' + name);
    activity_ref.set(
    {
      "category" : category,
      "location" : location,
    });
    // clear form
    $("#inp_trip_name").val("");
    $("#inp_trip_location").val("");
  });

  // register on click event for submit_activity button - relative to this user
  $("#submit_activity").on("click", function(event)
  {
    event.preventDefault();
    // Capture User Inputs and store them into variables
    var category = $("#inp_activity_category").val();
    var name     = $("#inp_activity_name").val().trim();
    var location = $("#inp_activity_location").val().trim();
    // log data
    console.log("category: ", category, "name: ", name, "location: ", location);
    // store data
    activity_ref = firebase.database().ref('travel_buddy/users' + '/' + user_uid + '/trips/' + name);
    activity_ref.set(
    {
      "category" : category,
      "location" : location,
    });
    // clear form
    $("#inp_activity_name").val("");
    $("#inp_activity_location").val("");
  });
});

//
// Event Functions
//


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
