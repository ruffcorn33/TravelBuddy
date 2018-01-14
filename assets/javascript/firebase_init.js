// Initialize Firebase

// var config =
// { // Project DB - uses auth
//   apiKey: "AIzaSyAmo21fRAZj2Qob-T3rWAe2dSI2dLJ9i0c",
//   authDomain: "fullstackproje.firebaseapp.com",
//   databaseURL: "https://fullstackproje.firebaseio.com",
//   projectId: "fullstackproje",
//   storageBucket: "fullstackproje.appspot.com",
//   messagingSenderId: "632114626173"
// };

var config =
{ // demo DB - no auth
  apiKey: "AIzaSyANDywSVU9hHax6WE8PMuaiDK3qdTdsj78",
  authDomain: "fir-21155.firebaseapp.com",
  databaseURL: "https://fir-21155.firebaseio.com",
  projectId: "fir-21155",
  storageBucket: "fir-21155.appspot.com",
  messagingSenderId: "614199486533"
};
firebase.initializeApp(config);
// grab handle to the database 'travel_buddy' child - this ref is the root of the travel_buddy data
var travel_ref = firebase.database().ref("travel_buddy");
// grab handle to the 'users' child
var users_ref = firebase.database().ref("travel_buddy/users");
// grab handle to the 'activity_categories' child
var activity_categories_ref = firebase.database().ref("travel_buddy/activity_categories");
