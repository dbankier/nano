var nano = require("nano");
var $model = {
  person: {
    first: "David",
    last: "Bankier"
  },
  field:"asdf"
};

$.index.open();
nano($,$model);
