// firebase_main.js
//   the Firebase Library for TravelBuddy

//
// Global Scope
//

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
  console.log("Actvity Categories:", activityCategoriesArray);
  // now build the html for the form
  // TODO - integrate? with Project UI (maybe just delete?)
  set_categories_selection();
});

// add/update a trip in Firebase - 'exposed' method to the app
//   event - the event from the click-handler
//   update - boolean whether to update existing trip
//
//   return false if a different trip than active trip
function do_submit_trip(event, update)
{
  // return value
  var rv = true;
  // Capture User Inputs and store them into variables
  // TODO - use Project UI ids
  trip_name      = $("#inp_trip_name").val().trim();
  var location   = $("#inp_trip_location").val().trim();
  var start_date = $("#inp_start_date").val();
  var end_date   = $("#inp_end_date").val();
  // log data
  console.log("name: ", trip_name, "location: ", location, "start_date", start_date, "end_date", end_date);
  // get the Firebase ref for the current trip
  active_trip_ref = firebase.database().ref('travel_buddy/users/' + user_uid + '/trips/' + trip_name);
  // store data
  store_trip(trip_name,
    {
      "location" : location,
      "start_date" : start_date,
      "end_date" : end_date,
    }, update);
  // set the active trip name
  if (current_trip_name !== trip_name)
  {
    // different trip than currently displayed
    rv = false;
  }
  current_trip_name = trip_name;
  // get Firebase ref to this trip's activities object
  activities_ref = firebase.database().ref('travel_buddy/users/' + user_uid + '/trips/' + trip_name + '/activities');
  // register the events for the submit activity UI
  // TODO - integrate with real Project UI
  register_activity_ui(trip_name);

  return rv;
}

// add/update a activity in Firebase - 'exposed' method to the app
//   event - the event from the click-handler
//   update - boolean whether to update existing activity
//
//   return false if a different activity than current activity
function do_submit_activity(event, update)
{
  // return value
  var rv = true;
  // Capture User Inputs and store them into variables
  // TODO - use Project UI ids
  var category      = $("#inp_activity_category").val();
  var activity_name = $("#inp_activity_name").val().trim();
  var location      = $("#inp_activity_location").val().trim();
  // log data
  console.log("category: ", category, "name: ", activity_name, "location: ", location);
  // get Firebase ref for this activity
  var activity_ref = firebase.database().ref('travel_buddy/users/' + user_uid + '/trips/' + current_trip_name + '/activities/' + activity_name);
  // store data
  store_activity(activity_name,
    {
      "category" : category,
      "location" : location,
    }, update);
  // set the current activity name
  if (current_activity_name !== activity_name)
  {
    // different activity than currently displayed
    rv = false;
  }
  current_activity_name = activity_name;

  return rv;
}

// take the Google User object and sign-in to TravelBuddy
function do_travel_buddy_signin(u)
{
  var obj = {
    "name": u.displayName,
    "email": u.email,
    "photoURL": u.photoURL,
  };

  // fetch the user record if it exists, else create it
  var tb_user = undefined;
  query_user(u.uid).then(function(usr)
  {
    tb_user = usr;
    if (typeof tb_user === "object")
    {
      // existing user
    } else {
      // new user, create it
      store_user(u.uid, obj, false);
    }
  });

  // TODO - integrate with Project UI
  // display_user(obj);
}

//
// Event Functions
//

//
// CRUD Functions
//

// return a promise which returns the JSON object for the currently logged in user
// if nothing passed in for uid, use the current signed in user
function query_user(uid)
{
  var deferred = $.Deferred(); // force synchronous 'cuz Firebase could be slow
  if ((typeof uid == 'undefined') || (uid.length <= 0))
  {
    // get logged in user
    var firebase_user = firebase.auth().currentUser;
    if (firebase_user)
      user_uid = firebase_user.uid;
    else
      return deferred.reject(undefined);
  } else {
    user_uid = uid;
  }
  users_ref.child(user_uid).once('value').then(function(user_snap)
  {
    // reset global user object
    user = user_snap.val();
    console.log("in query_user:once, snap.val():", user)
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
// if nothing passed in for activity_name, use global current acivivty
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

// store a user in Firebase
//   id: the id of the user to store
//   user: a user object
//   update: boolean to update existing or not, optional
function store_user(id, user, update)
{
  var user_ref = firebase.database().ref('travel_buddy/users/' + id);
  if ((typeof update != 'undefined') && (update === true))
  {
    user_ref.update(
    {
      "name" : user.name,
      "email" : user.email,
      "photoURL" : user.photoURL,
    });
  } else {
    user_ref.set(
    {
      "name" : user.name,
      "email" : user.email,
      "photoURL" : user.photoURL,
    });
  }
}

// store a trip in Firebase
//   id: the id of the trip to store
//   trip: a trip object
//   update: boolean to update existing or not, optional
function store_trip(id, trip, update)
{
  var trip_ref = firebase.database().ref('travel_buddy/users/' + user_uid + '/trips/' + id);

  if ((typeof update != 'undefined') && (update === true))
  {
    console.log("updating trip:", id);
    var obj = {};
    if ((typeof trip.location != 'undefined') && (trip.location.length > 0))
      obj.location = trip.location;
    if ((typeof trip.start_date != 'undefined') && (trip.start_date.length > 0))
      obj.start_date = trip.start_date;
    if ((typeof trip.end_date != 'undefined') && (trip.end_date.length > 0))
      obj.end_date = trip.end_date;
    trip_ref.update(obj);
  } else {
    console.log("creating trip:", id);
    if ((typeof trip.location == 'undefined') || (trip.location.length <= 0))
    {
      console.log("Must supply a trip location!");
      return false;
    }
    if ((typeof trip.start_date == 'undefined') || (trip.start_date.length <= 0))
    {
      console.log("Must supply a trip start date!");
      return false;
    }
    if ((typeof trip.end_date == 'undefined') || (trip.end_date.length <= 0))
      trip.end_date = trip.start_date; // end date allowed to be missing
    trip_ref.set({
      "location" : trip.location,
      "start_date" : trip.start_date,
      "end_date" : trip.end_date,
    });
  }
  return true;
}

// store an activity in Firebase
//   id: the id of the activity to store
//   activity: a activity object
//   update: boolean to update existing or not, optional
function store_activity(id, activity, update)
{
  var activity_ref = firebase.database().ref('travel_buddy/users/' + user_uid + '/trips/' + current_trip_name + '/activities/' + id);
  if ((typeof update != 'undefined') && (update === true))
  {
    console.log("updating activity:", id);
    var obj = {};
    if ((typeof activity.location != 'undefined') && (activity.location.length > 0))
      obj.location = activity.location;
    if ((typeof activity.category != 'undefined') && (activity.category.length > 0))
      obj.category = activity.category;
    activity_ref.update(obj);
  } else {
    console.log("creating activity:", id);
    if (!validate_exists(activity.location))
    {
      console.log("Must supply an activity location!");
      return false;
    }
    if (!validate_exists(activity.category))
    {
      console.log("Must supply an activity category!");
      return false;
    }
    activity_ref.set(
    {
      "location" : activity.location,
      "category" : activity.category,
    });
  }
}

// delete a trip from Firebase
//   id: the id of the trip to delete
function delete_trip(id)
{
  var trip_ref = firebase.database().ref('travel_buddy/users/' + user_uid + '/trips/' + id);
  console.log("deleting trip:", id);
  if (!validate_exists(id))
  {
    console.log("Must supply an id!");
    return false;
  }
  trip_ref.remove();
}

// delete a activity from Firebase
//   id: the id of the activity to delete
function delete_activity(id)
{
  var activity_ref = firebase.database().ref('travel_buddy/users/' + user_uid + '/trips/' + current_trip_name + '/activities/' + id);
  console.log("deleting activity:", id);
  if (!validate_exists(id))
  {
    console.log("Must supply an id!");
    return false;
  }
  activity_ref.remove();
}

//
// Utility Functions
//

// validate that a variable exists and has a string length of at least 1 character
// return true if above is true, otherwise false
function validate_exists(v)
{
  if ((typeof v == 'undefined') || (v.length <= 0))
  {
    return false;
  }
  return true;
}
