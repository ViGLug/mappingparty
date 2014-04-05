Elements = new Meteor.Collection('elements');

Meteor.startup(function () {
    // Cleanup
    Elements.remove({});
});

Elements.allow({
  insert: function (userId, element) {
    return (userId && element.userId === userId);
  },
});