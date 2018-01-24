// firebase_demo.js
//   the JaveScript to make the firebase_demo_form.html page function

//
// Global Scope
//

function set_categories_selection()
{
  for ( var i = 0; i < activityCategoriesArray.length; ++i)
  {
    var option = $('<option>' + activityCategoriesArray[i] + '</option>');
    $('#inp_activity_category').append(option);
  }
}

// TODO - use proper log in stuff - 'child_added' is used instead of 'value' to get only one user (for now)
users_ref.once('child_added').then(function(user_snap)
{
  var user = user_snap.val();
  user_uid = user_snap.key;
  user_ref = firebase.database().ref('travel_buddy/users/' + user_uid);
  user_trips_ref = firebase.database().ref('travel_buddy/users/' + user_uid + '/trips');
  var trip_name = "";
  console.log("User Key:", user_snap.key, "User:", user);
  display_user(user);

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
    if (do_submit_trip(event, false))
    {
      // clear activities
      $('#activityRows').empty();
    }

    // clear form
    // $("#inp_trip_name").val("");
    // $("#inp_trip_location").val("");
    // display the active trip name
    $('#activeTrip').text(current_trip_name);
    // enable the submit_activity button
    $('#submit_activity').prop("disabled", false);
    $('#update_activity').prop("disabled", false);
  });

  // register on click event for update_trip button - relative to this user
  $("#update_trip").on("click", function(event)
  {
    event.preventDefault();
    // TODO - save and check id vs current trip - if the name changed, need to delete the old id
    if (do_submit_trip(event, true))
    {
      // clear activities
      $('#activityRows').empty();
    }

    // clear form
    // $("#inp_trip_name").val("");
    // $("#inp_trip_location").val("");
    // display the active trip name
    $('#activeTrip').text(current_trip_name);
    // enable the submit_activity button
    $('#submit_activity').prop("disabled", false);
    $('#update_activity').prop("disabled", false);
  });

  // register on click event for delete_trip button - relative to this user
  $("#delete_trip").on("click", function(event)
  {
    event.preventDefault();
    delete_trip($("#inp_trip_name").val().trim());
  });
});

//
// Event Functions
//

// on click event for trip name selection
$('#tripRows').on('click', 'td.user_trip', function()
{
  // get the trip name clicked on
  var trip_name = $(this).text();
  // set the active trip name
  if (current_trip_name !== trip_name)
  {
    // clear activities
    $('#activityRows').empty();
  }
  current_trip_name = trip_name;
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
  $('#update_activity').prop("disabled", false);
});

// on click event for the dump_user button
$('#dump_user').on('click', function()
{
  query_user(user_uid).then(function(usr)
  {
    demo_JSON_dump(usr);
  });
});

// on click event for the dump_trip button
$('#dump_trip').on('click', function()
{
  query_trip().then(function(trip)
  {
    demo_JSON_dump(trip);
  });
});

// on click event for the dump_activity button
$('#dump_activity').on('click', function()
{
  query_activity().then(function(activity)
  {
    demo_JSON_dump(activity);
  });
});

//
// Utility Functions
//
function display_user(user)
{
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
    do_submit_activity(event, false);
    // clear form
    // $("#inp_activity_name").val("");
    // $("#inp_activity_location").val("");
  });

  // register on click event for update_activity button - relative to this user/trip
  $("#update_activity").on("click", function(event)
  {
    event.preventDefault();
    do_submit_activity(event, true);
    // clear form
    // $("#inp_activity_name").val("");
    // $("#inp_activity_location").val("");
  });

  // register on click event for delete_activity button - relative to this user/trip
  $("#delete_activity").on("click", function(event)
  {
    event.preventDefault();
    delete_activity($("#inp_activity_name").val().trim());
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

// debug function to dump a JSON object
function demo_JSON_dump(obj)
{
  $('#firebase_dump').text(JSON.stringify(obj, null, 2));
}
