Meteor.subscribe('tags');
Meteor.subscribe('elements');

Tags = new Meteor.Collection('tags');
Elements = new Meteor.Collection('elements');

Template.map.rendered = function() {
  var map = L.map('map').setView([45.500, 9.35], 10);

  // add an OpenStreetMap tile layer
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
}

function showError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      alert("Permesso negato")
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Informazione non disponibile");
      break;
    case error.TIMEOUT:
      alert("Timeout");
      break;
    case error.UNKNOWN_ERROR:
      alert("Impossibile localizzarti");
      break;
  }
}

function sendLocation(position) {
  Elements.insert({
    type:'poi',
    userId:Meteor.userId(),
    points:[{
      latitude:position.coords.latitude,
      longitude:position.coords.longitude,
      accuracy:position.coords.accuracy,
      timestamp:position.timestamp
    }]
  });
}

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(sendLocation, showError);
} else {
    alert("Il tuo browser non supporta la geolocalizzazione");
}
