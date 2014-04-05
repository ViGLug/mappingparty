Meteor.subscribe('users');
Meteor.subscribe('tags');
Meteor.subscribe('elements');

Users = new Meteor.Collection('users');
Tags = new Meteor.Collection('tags');
Elements = new Meteor.Collection('elements');

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
    latitude:position.coords.latitude,
    longitude:position.coords.longitude,
    accuracy:position.coords.accuracy,
  });
}

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(sendLocation, showError);
} else {
    alert("Il tuo browser non supporta la geolocalizzazione");
}