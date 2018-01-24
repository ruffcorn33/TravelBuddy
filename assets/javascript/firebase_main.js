// firebase_main.js
//   the Firebase Library for TravelBuddy

//
// Global Scope
//

// array of activity categories stored in Firebase
var activityCategoriesArray = [];

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
  // set_categories_selection();
});

load_default_user();

// load 'default' user
// that is to say, create a random user to use for the session
// if this user ends up with any data, transfer it to the newly logged in user
// this session user can only change if a different user signs in
function load_default_user()
{
  var session_uid = localStorage.getItem("user_uid");
  if (validate_exists(session_uid))
  {
    user_uid = session_uid;
    var ls_trip = localStorage.getItem("tripName");
    if (validate_exists(ls_trip))
    {
      current_trip_name = ls_trip.replace(/\//g, "");
      active_trip_ref = firebase.database().ref('travel_buddy/users/' + user_uid + '/trips/' + current_trip_name);
    }
  } else {
    var session_user_ref = users_ref.push(
          {
            "name": "Session User"
          });
    user_ref = session_user_ref;
    user_uid = session_user_ref.key;
    localStorage.setItem("user_uid", user_uid);
    localStorage.setItem("user_name", "Session User");
    console.log("session user id:", user_uid);
    // on disconnect remove the session user object
    // !!!
    // It appears as if switching pages counts as a disconnect
    // TODO - add code to remove stale session users
    // !!!
    // session_user_ref.onDisconnect().remove();
  }
}

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
  var session_uname = localStorage.getItem("user_name");
  var session_uid = localStorage.getItem("user_uid");
  var obj = {};
  if (session_uname === "Session User")
  {
    // copy session user's trips into signed in user's object
    query_user(session_uid).then(function(usr)
    {
      obj = usr;
      obj.name = u.displayName;
      obj.email = u.email;
      obj.photoURL = u.photoURL;
      var session_user_ref = firebase.database().ref("travel_buddy/users/" + session_uid);
      session_user_ref.remove();
    });
  } else {
    obj = {
      "name": u.displayName,
      "email": u.email,
      "photoURL": u.photoURL,
    };
  }

  // fetch the user record if it exists, else create it
  var tb_user = undefined;
  query_user(u.uid).then(function(usr)
  {
    tb_user = usr;
    if (typeof tb_user === "object")
    {
      // existing user, update with session
      store_user(u.uid, obj, true);
    } else {
      // new user, create it
      store_user(u.uid, obj, false);
    }
  });

  // set localStorage
  localStorage.setItem("user_uid", u.uid);
  localStorage.setItem("user_name", u.displayName);
  localStorage.setItem("user_email", u.email);
  localStorage.setItem("user_photoURL", u.photoURL);
}

// sign out of TravelBuddy
function do_travel_buddy_signout()
{
  // because firebase.auth().onAuthStateChanged() calls this each time
  // a new html gets loaded, need to check the user name to see if we're
  // just a session user before clearing localStorage
  var uname = localStorage.getItem("user_name");
  if (uname === "Session User")
    return;
  localStorage.removeItem("user_uid");
  localStorage.removeItem("user_name");
  localStorage.removeItem("user_email");
  localStorage.removeItem("user_photoURL");
  localStorage.removeItem("tripPid");
  localStorage.removeItem("tripName");
  localStorage.removeItem("tripDestination");
  localStorage.removeItem("tripLoc");
  localStorage.removeItem("tripLat");
  localStorage.removeItem("tripLng");
  localStorage.removeItem("tripBegDate");
  localStorage.removeItem("tripEndDate");
  load_default_user();
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
  if (!validate_exists(uid))
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
    var user = user_snap.val();
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
  if (!validate_exists(trip_name))
  {
    if (!validate_exists(current_trip_name))
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

// return a promise which returns the JSON object for the activity
// if nothing passed in for activity_name, use global current acivivty
function query_activity(activity_name)
{
  var deferred = $.Deferred(); // force synchronous 'cuz Firebase could be slow
  var activity;
  if (!validate_exists(activity_name))
  {
    if (!validate_exists(current_activity_name))
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
  if (validate_exists(id))
  {
    id = id.replace(/\//g, ""); // can't have '/' in Firebase ids
  } else {
    console.log("store_user called without an id");
    return false;
  }
  var user_ref = firebase.database().ref('travel_buddy/users/' + id);
  if ((typeof update != 'undefined') && (update === true))
  {
    var obj = {};
    if (validate_exists(user.name))
      obj.name = user.name;
    if (validate_exists(user.email))
      obj.email = user.email;
    if (validate_exists(user.photoURL))
      obj.photoURL = user.photoURL;
    user_ref.update(obj);
  } else {
    user_ref.set(user);
  }
}

// store a trip in Firebase
//   id: the id of the trip to store
//   trip: a trip object
//   update: boolean to update existing or not, optional
function store_trip(id, trip, update)
{
  if (validate_exists(id))
  {
    id = id.replace(/\//g, ""); // can't have '/' in Firebase ids
  } else {
    console.log("store_trip called without an id");
    return false;
  }
  var trip_ref = firebase.database().ref('travel_buddy/users/' + user_uid + '/trips/' + id);

  if ((typeof update != 'undefined') && (update === true))
  {
    console.log("updating trip:", id);
    var obj = {};
    if (validate_exists(trip.location))
      obj.location = trip.location;
    if (validate_exists(trip.start_date))
      obj.start_date = trip.start_date;
    if (validate_exists(trip.end_date))
      obj.end_date = trip.end_date;
    if (validate_exists(trip.place_id))
      obj.place_id = trip.place_id;
    trip_ref.update(obj);
    if (id !== current_trip_name)
    {
      console.log("removing old node", active_trip_ref.key);
      // if the user renamed the trip, remove the old node
      active_trip_ref.remove();
    }
  } else {
    console.log("creating trip:", id);
    if (!validate_exists(trip.location))
    {
      console.log("Must supply a trip location!");
      return false;
    }
    if (!validate_exists(trip.start_date))
    {
      console.log("Must supply a trip start date!");
      return false;
    }
    if (!validate_exists(trip.end_date))
      trip.end_date = trip.start_date; // end date allowed to be missing
    trip_ref.set(trip);
  }
  current_trip_name = id;
  active_trip_ref = trip_ref;
  return true;
}

// store an activity in Firebase
//   id: the id of the activity to store
//   activity: a activity object
//   update: boolean to update existing or not, optional
function store_activity(id, activity, update)
{
  if (validate_exists(id))
  {
    id = id.replace(/\//g, ""); // can't have '/' in Firebase ids
  } else {
    console.log("store_activity called without an id");
    return false;
  }
  var activity_ref = firebase.database().ref('travel_buddy/users/' + user_uid + '/trips/' + current_trip_name + '/activities/' + id);
  if ((typeof update != 'undefined') && (update === true))
  {
    console.log("updating activity:", id);
    var obj = {};
    if (validate_exists(activity.place_id))
      obj.place_id = activity.place_id;
    if (validate_exists(activity.lat))
      obj.lat = activity.lat;
    if (validate_exists(activity.lng))
      obj.lng = activity.lng;
    if (validate_exists(activity.category))
      obj.category = activity.category;
    activity_ref.update(obj);
  } else {
    console.log("creating activity:", id);
    if (!validate_exists(activity.category))
    {
      console.log("Must supply an activity category!");
      return false;
    }
    delete activity.name; // name is the key
    activity_ref.set(activity);
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
  if ((typeof v == 'undefined') || v == null || (v.length <= 0))
  {
    return false;
  }
  return true;
}
