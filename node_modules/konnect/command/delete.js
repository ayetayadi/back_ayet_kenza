
"use strict";
var file = require("../helper/file");
var W = require("TFWhatIs");

exports.del = function(name) {
  var items = file.read('../schema.json');
  if(items[name] !== undefined){
    delete items[name];
    file.write(items, function(result) {
      if (result) {
        console.log("\n"+name+" successfully deleted\n");
      }
    });
  } else {
    console.error("\nCommand doesn't exist\n");
  }

};
