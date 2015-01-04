var nano = require("nano");
var $model = {
  first: "David",
  last: "Bankier"
};

$.index.open();
nano($,$model);
