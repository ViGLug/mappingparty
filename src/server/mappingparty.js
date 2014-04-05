// Users = new Meteor.Collection('users');
Tags = new Meteor.Collection('tags');
Elements = new Meteor.Collection('elements');

Meteor.startup(function () {
    // Cleanup
//     Users.remove({});
    Tags.remove({});
    Elements.remove({});
    
    if (Tags.find().count() === 0) {
        Tags.insert({name:"Cestino", osm_key:'amenity',
            osm_value:['waste_disposal']});
        Tags.insert({name:"Autonoleggio", osm_key:'amenity',
            osm_value:['car_rental']});
    }
});