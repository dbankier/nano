var nano = require("nano");
//nano.syntax(/\-\=(.+?)\=\-/gi);

var $model = {
  person: {
    first: "David",
    last: "Bankier",
    bool:true
  },
  field:"asdf"
};
setTimeout(function() {
  $model.person.first = "First";
  nano.apply();
},1000);

$.index.open();
nano($,$model);
