Meteor.subscribe('users');
Meteor.subscribe('tags');
Meteor.subscribe('elements');

Users = new Meteror.Collection('users');
Tags = new Meteror.Collection('tags');
Elements = new Meteror.Collection('elements');