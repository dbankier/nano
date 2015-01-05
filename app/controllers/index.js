var nano = require("nano");
var $model = {
  person: {
    first: "David",
    last: "Bankier"
  },
  field:"asdf"
};
setTimeout(function() {
  $model.person.first = "First";
  nano.apply();
},1000);

$.index.open();
nano($,$model);
