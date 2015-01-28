Object.defineProperty($, "text", {
    set: function(val) {
      $.text_field.value = val;
    },
    get: function() {
      return $.text_field.value;
    }
});

Object.defineProperty($, "label", {
    set: function(val) {
      $.label_field.text = val;
    },
    get: function(val) {
      return $.label_field.text;
    }
});
