Meteor.subscribe('users');
Meteor.subscribe('tags');
Meteor.subscribe('elements');

Users = new Meteor.Collection('users');
Tags = new Meteor.Collection('tags');
Elements = new Meteor.Collection('elements');