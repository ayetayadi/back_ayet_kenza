"use strict";
var jsonfile = require('jsonfile');

var File = function() {

};

File.prototype.read = function(jsonFile) {
  return require(jsonFile);
};

File.prototype.write = function(json, cb) {
  jsonfile.writeFile('schema.json', json, function (err) {
    if (err) {
      cb(false);
    } else {
      cb(true);
    }
  });
};

module.exports = new File();
