//
// This file handles the Google Auth
//
// Make sure it is loaded AFTER the file that initializes Firebase
//

// on click event for clicking the Login/Logout button
// $('#google_sign_in').on('click', function(event)
function toggleSignIn()
{
  if (!firebase.auth().currentUser)
  {
    console.log("attempting login");
    // auth provider
    var provider = new firebase.auth.GoogleAuthProvider();
    // add a scope to the provider
    provider.addScope('https://www.googleapis.com/auth/plus.login');
    // sign in via redirect
    firebase.auth().signInWithRedirect(provider);
  } else {
    console.log("calling .signOut()");
    // signout
    firebase.auth().signOut().then(function()
    { // sign-out successful
    }).catch(function(error) {
      // an error happened
      console.log("ERROR signing out:", error);
    });
  }
  // disble the button
  $('#google_sign_in').prop("disabled", true);
}

//
// initApp handles setting up UI event listeners and registering Firebase auth listeners:
//  - firebase.auth().onAuthStateChanged:  This listener is called when the user is signed in or
//    out, and that is where we update the UI.
//  - firebase.auth().getRedirectResult():  This promise completes when the user gets back from
//    the auth redirect flow.  It is where you can get the OAuth access token from the IDP.
//
function initApp()
{
  // result from Redirect auth flow
  firebase.auth().getRedirectResult().then(function(result)
  {
    if (result.credential)
    {
      // Google Access Token, use it to access the Google API
      var token = result.credential.accessToken;
      console.log("Google Token:", token);
    }
    // signed-in user info
    var user = result.user;
    console.log("User:", user);
  }).catch(function(error)
  {
    // error handler
    var errorCode = error.code;
    var errorMessage = error.message;
    var email = error.email;
    // firebase.auth.AuthCredential type used
    var credential = error.credential;
    if (errorCode === 'auth/account-exists-with-different-credential')
    {
      alert('You have already signed up with a different auth provider for that email.');
      // handle linking the user's accounts from multiple auth providers here
    } else {
      console.log(error);
    }
  });

  // Listening for auth state changes.
  firebase.auth().onAuthStateChanged(function(u)
  {
    console.log("in onAuthStateChanged()");
    if (u)
    {
      // user is signed in
      var displayName = u.displayName;
      var email = u.email;
      var uid = u.uid;
      console.log("user logged in:", displayName, email, uid);
      // sign in to the app
      do_travel_buddy_signin(u);
      // toggle text in button
      $('#google_sign_in').text('Sign out ' + displayName);
    } else {
      console.log("user logged out");
      // user is signed out
      $('#google_sign_in').text('Sign in with Google');
    }
    // enable the button
    $('#google_sign_in').prop("disabled", false);
  });

  document.getElementById('google_sign_in').addEventListener('click', toggleSignIn, false);
}

window.onload = function()
{
  initApp();
};
