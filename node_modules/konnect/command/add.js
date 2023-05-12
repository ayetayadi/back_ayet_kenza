"use strict";
var file = require("../helper/file");
var W = require("TFWhatIs");

exports.add = function(name, command, keywords) {
  var items = file.read('../schema.json');
  items[name] = {
    "name": name,
    "command": command,
    "keywords": keywords
  };
  file.write(items, function(result) {
    if (result) {
      console.log("\nCommand successfully added\n");
    }
  });
};
