// firebase_main.js


// on click event for submit button
$("#submit_activity").on("click", function(event)
{
  event.preventDefault();
  // Capture User Inputs and store them into variables
  var group    = $("#inp_group").val().trim();
  var name     = $("#inp_name").val().trim();
  var location = $("#inp_location").val().trim();
  // log data
  console.log("group: ", group, "name: ", name, "location: ", location);
  // store data
  travel_ref.push(
  {
    group: group,
    name: name,
    location : location,
  });
  // clear form
  $("#inp_group").val("");
  $("#inp_name").val("");
  $("#inp_location").val("");
});

// Firebase on childAdded event
travel_ref.orderByChild("group").on("child_added", function(child)
{
  var activity = child.val();
  // log child
  console.log(activity);
  // build the table row
  var tr = $('<tr>'
            + '<td>' + activity.group + '</td>'
            + '<td>' + activity.name + '</td>'
            + '<td>' + activity.location + '</td>'
            );
  // Writes the saved value from firebase to our display
  $("#additionalRows").append(tr);
}, function(errorObject)
{ // Handles firebase failure if it occurs
  console.log("The read failed: " + errorObject.code);
});
