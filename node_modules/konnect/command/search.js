"use strict";
var file = require("../helper/file");
var W = require("TFWhatIs");

exports.search = function(query) {
  var items = file.read('../schema.json');
  if (!W.isFalsey(items)) {
    console.log("\n\t\tName\t\t\t\tCommand\t\t\t\t\t\t\t\t\t\t\t\tKeywords\n");
    W.for(items, function(key, item, items){
      if (item.name.indexOf(query) >=0 ||
          item.command.indexOf(query) >=0 ||
          item.keywords.indexOf(query) >=0 ) {
            console.log("\t\t"+item.name+"\t\t\t\t"+item.command+"\t\t\t"+item.keywords);
      }
    });
    console.log("\n");
  } else {
    console.error("Nothing exist. Please add some commands");
  }
};
