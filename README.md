# TravelBuddy
TravelBuddy is an app which acts as a personal assistant for someone going on a trip.  It gives the current weather at the destination and allows the user to search maps for activities, restaurants, what-have-you, saving the locations in lists for each trip.

## Deployed

Hosting URL: https://travelbuddy-8ad21.firebaseapp.com/

## Built With

APIs:
* Google Maps JavaScript API
* Google Maps Geocoding API
* Google Places API Web Service
* OpenWeatherMaps API

Libraries:
* jQuery
* Firebase
* Gijgo library
* [Axios](https://github.com/axios/axios)

Other:
* Bootstrap
* Google Fonts
* Font Awesome

### Completed Features

- [x] Google authentication
- [x] Use Google Geocoding to get location data from user input
- [x] Use location data to display a Google map
- [x] Use local storage to pass data from welcome page to main page
- [x] Use Google Places to perform a nearbySearch using selected category
- [x] Place markers on map for places returned by nearbySearch
- [x] Use animation when placing markers
- [x] Display infowindow when place marker is clicked
- [x] 'Add' button on infowindow adds that place to selected category list
- [x] 'Add' button saves an activity object
- [x] Weather for destination location
- [x] Full CRUD functionality in Firebase
- [x] Retrieval of saved trips for returning user

### Next Steps

Features that we would like to add at some point in the future.

- [ ] Use Geolocation to place user's current location on map
- [ ] Generate directions from user's current location to chosen activity
- [ ] Dynamically built categories sidebar
- [ ] Allow user to add own categories
- [ ] Add other federated sign-in methods
- [ ] Firebase rules to restrict access to user's own trips
- [ ] Delete stale session user nodes

## Authors (a.k.a Team A/C)

* Christopher Biessener
* Craig Christensen
* Cristina Zhang
* Chris York

## Copyright

All code (c) Team A/C
