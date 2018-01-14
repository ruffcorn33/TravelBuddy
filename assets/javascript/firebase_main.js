// firebase_main.js

//
// generally:
//  use .set() when the user submits a form
//  use .update() when editing, or to save to multiple locations at once
//

//
// Global Scope
//

// array of activity categories stored in Firebase
var activityCategoriesArray = [];

// set activityCategoriesArray once at first load
activity_categories_ref.orderByKey().once('value').then(function(snapshot)
{
  activityCategoriesArray = snapshot.val();
  console.log("Actvity Catagories:", activityCategoriesArray);
  // now build the html for the form
  for ( var i = 0; i < activityCategoriesArray.length; ++i)
  {
    var option = $('<option>' + activityCategoriesArray[i] + '</option>');
    $('#inp_category').append(option);
  }
});

//
// Event Functions
//

// on click event for submit button
$("#submit_activity").on("click", function(event)
{
  event.preventDefault();
  // Capture User Inputs and store them into variables
  var category = $("#inp_category").val().trim();
  var name     = $("#inp_name").val().trim();
  var location = $("#inp_location").val().trim();
  // log data
  console.log("category: ", category, "name: ", name, "location: ", location);
  // store data
  travel_ref.push(
  {
    category: category,
    name: name,
    location : location,
  });
  // clear form
  $("#inp_category").val("");
  $("#inp_name").val("");
  $("#inp_location").val("");
});

// Firebase on childAdded event
// travel_ref.orderByChild("category").on("child_added", function(child)
// {
//   var activity = child.val();
//   // log child
//   console.log("Activity:", activity);
//   // build the table row
//   var tr = $('<tr>'
//             + '<td>' + activity.category + '</td>'
//             + '<td>' + activity.name + '</td>'
//             + '<td>' + activity.location + '</td>'
//             );
//   // Writes the saved value from firebase to our display
//   $("#additionalRows").append(tr);
// }, function(errorObject)
// { // Handles firebase failure if it occurs
//   console.log("The read failed: " + errorObject.code);
// });
