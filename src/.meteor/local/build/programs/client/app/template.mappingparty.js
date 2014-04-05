(function(){
UI.body.contentParts.push(UI.Component.extend({render: (function() {
  var self = this;
  return Spacebars.include(self.lookupTemplate("hello"));
})}));
Meteor.startup(function () { if (! UI.body.INSTANTIATED) { UI.body.INSTANTIATED = true; UI.DomRange.insert(UI.render(UI.body).dom, document.body); } });

Template.__define__("hello", (function() {
  var self = this;
  var template = this;
  return [ HTML.Raw("<h1>Hello World!</h1>\n  "), function() {
    return Spacebars.mustache(self.lookup("greeting"));
  }, HTML.Raw('\n  <input type="button" value="Click">') ];
}));

})();
