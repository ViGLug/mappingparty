Users = new Meteor.Collection('users');
Tags = new Meteor.Collection('tags');
Elements = new Meteor.Collection('elements');

Meteor.startup(function () {
    if (Tags.find().count() === 0) {
        Tags.insert({name: "Cestino", osm_key:'amenity',
            osm_value:['waste_disposal']});
    }
});