"use strict";
var file = require("../helper/file");
var W = require("TFWhatIs");

exports.list = function() {
  var items = file.read('../schema.json');
  if (!W.isFalsey(items)) {
    console.log("\n\t\tName\t\t\t\tCommand\t\t\t\t\t\t\t\t\t\t\t\tKeywords\n");
    W.for(items, function(key, item, items){
      console.log("\t\t"+item.name+"\t\t\t\t"+item.command+"\t\t\t"+item.keywords);
    });
    console.log("\n");
  } else {
    console.error("Nothing exist. Please add some commands");
  }
};
