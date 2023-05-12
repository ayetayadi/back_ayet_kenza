
"use strict";
var file = require("../helper/file");
var W = require("TFWhatIs");

exports.rename = function(oldName, newName) {
  var items = file.read('../schema.json');
  if(items[oldName] !== undefined){
    items[newName] = items[oldName];
    delete items[oldName];
    file.write(items, function(result) {
      if (result) {
        console.log("\n"+oldName+" successfully renamed to "+newName+"\n");
      }
    });
  } else {
    console.error("\nCommand doesn't exist\n");
  }

};
