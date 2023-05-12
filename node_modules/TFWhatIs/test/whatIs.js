"use strict";

var assert = require("assert"),
    What = require("../whatIs");

describe('WhatIs: ', function() {
  describe('type', function() {
    it("should return String for a string variable", function() {
      assert.equal(What.type("hello"), "String");
    });
    it("should return String for a empty string", function() {
      assert.equal(What.type(""), "String");
    });
    it("should return Boolean for false", function() {
      assert.equal(What.type(false), "Boolean");
    });
    it("should return Int for int", function() {
      assert.equal(What.type(234), "Int");
    });
    it("should return Int for -int", function() {
      assert.equal(What.type(-234), "Int");
    });
    it("should return Float for decimal", function() {
      assert.equal(What.type(234.23), "Float");
    });
    it("should return Float for -decimal", function() {
      assert.equal(What.type(-234.23), "Float");
    });
    it("should return NaN string for NaN", function() {
      assert.equal(What.type(NaN), "NaN");
    });
    it("should return Number string for Infinity", function() {
      assert.equal(What.type(1 / 0), "Number");
    });
    it("should return Number string for -Infinity", function() {
      assert.equal(What.type(-1 / 0), "Number");
    });
    it("should return Object for object", function() {
      assert.equal(What.type({}), "Object");
    });
    it("should return Array for array", function() {
      assert.equal(What.type([]), "Array");
    });
    it("should return Date for a date", function() {
      assert.equal(What.type(new Date()), "Date");
    });
    it("should return Undefined string for a undefined", function() {
      assert.equal(What.type(undefined), "Undefined");
    });
    it("should return Null string for a null value", function() {
      assert.equal(What.type(null), "Null");
    });
    it("should return Email for an email address", function() {
      assert.equal(What.type("test@test.com"), "Email");
    });
    it("should return Email for an email address with string", function() {
      assert.equal(What.type("test@test.com is my email address"), "String");
    });
    it("should return Url for a web address", function() {
      assert.equal(What.type("http://www.google.com/?q=testing"), "Url");
    });
    it("should return Phone for a phone number", function() {
      assert.equal(What.type("+44 7700 900804"), "Phone");
    });
    it("should return String for a string + phone number", function() {
      assert.equal(What.type("My phone number is - +44 7700 900804"), "String");
    });
    it("should return String for a phone number + string", function() {
      assert.equal(What.type("+44 7700 900804 - is my phone number"), "String");
    });
    it("should return Function for a function", function() {
      assert.equal(What.type(function() {
        //do nothing
      }), "Function");
    });
  });

  describe('trueType', function() {
    it("should return String for a string variable", function() {
      assert.equal(What.trueType("hello"), "String");
    });
    it("should return String for a empty string", function() {
      assert.equal(What.trueType(""), "String");
    });
    it("should return Boolean for false", function() {
      assert.equal(What.trueType(false), "Boolean");
    });
    it("should return Int for int", function() {
      assert.equal(What.trueType(234), "Number");
    });
    it("should return Int for -int", function() {
      assert.equal(What.trueType(-234), "Number");
    });
    it("should return Float for decimal", function() {
      assert.equal(What.trueType(234.23), "Number");
    });
    it("should return Float for -decimal", function() {
      assert.equal(What.trueType(-234.23), "Number");
    });
    it("should return NaN string for NaN", function() {
      assert.equal(What.trueType(NaN), "Number");
    });
    it("should return Number string for Infinity", function() {
      assert.equal(What.trueType(1 / 0), "Number");
    });
    it("should return Number string for -Infinity", function() {
      assert.equal(What.trueType(-1 / 0), "Number");
    });
    it("should return Object for object", function() {
      assert.equal(What.trueType({}), "Object");
    });
    it("should return Array for array", function() {
      assert.equal(What.trueType([]), "Array");
    });
    it("should return Date for a date", function() {
      assert.equal(What.trueType(new Date()), "Date");
    });
    it("should return Undefined string for a undefined", function() {
      assert.equal(What.trueType(undefined), "Undefined");
    });
    it("should return Null string for a null value", function() {
      assert.equal(What.trueType(null), "Null");
    });
    it("should return Email for an email address", function() {
      assert.equal(What.trueType("test@test.com"), "String");
    });
    it("should return Email for an email address with string", function() {
      assert.equal(What.trueType("test@test.com is my email address"), "String");
    });
    it("should return Url for a web address", function() {
      assert.equal(What.trueType("http://www.google.com/?q=testing"), "String");
    });
    it("should return Phone for a phone number", function() {
      assert.equal(What.trueType("+44 7700 900804"), "String");
    });
    it("should return String for a string + phone number", function() {
      assert.equal(What.trueType("My phone number is - +44 7700 900804"), "String");
    });
    it("should return String for a phone number + string", function() {
      assert.equal(What.trueType("+44 7700 900804 - is my phone number"), "String");
    });
    it("should return Function for a function", function() {
      assert.equal(What.type(function() {
        //do nothing
      }), "Function");
    });
  });

  describe('isNaN', function() {
    it("should return true for NaN", function() {
      assert.equal(What.isNaN(NaN), true);
    });
    it("should return false for string", function() {
      assert.equal(What.isNaN("hello"), false);
    });
    it("should return false for int", function() {
      assert.equal(What.isNaN(3434), false);
    });
    it("should return false for decimal", function() {
      assert.equal(What.isNaN(3434.324), false);
    });
    it("should return false for undefined", function() {
      assert.equal(What.isNaN(undefined), false);
    });
    it("should return false for 0", function() {
      assert.equal(What.isNaN(0), false);
    });
    it("should return false for false", function() {
      assert.equal(What.isNaN(false), false);
    });
    it("should return false for object", function() {
      assert.equal(What.isNaN({}), false);
    });
    it("should return false for array", function() {
      assert.equal(What.isNaN([]), false);
    });
    it("should return false for null", function() {
      assert.equal(What.isNaN(null), false);
    });
  });

  describe('isFalsey', function() {
    it("should return true for false", function() {
      assert.equal(What.isFalsey(false), true);
    });
    it("should return true for null", function() {
      assert.equal(What.isFalsey(null), true);
    });
    it("should return true for 0", function() {
      assert.equal(What.isFalsey(0), true);
    });
    it("should return true for undefined", function() {
      assert.equal(What.isFalsey(undefined), true);
    });
    it("should return true for NaN", function() {
      assert.equal(What.isFalsey(NaN), true);
    });
    it("should return true for empty string", function() {
      assert.equal(What.isFalsey(""), true);
    });
    it("should return true for a empty string with spaces", function() {
      assert.equal(What.isFalsey("        "), true);
    });

    it("should return true for an empty object", function() {
      assert.equal(What.isFalsey({

      }), true);
    });
    it("should return true for an empty array", function() {
      assert.equal(What.isFalsey([]), true);
    });
    it("should return false for an array of empty array", function() {
      assert.equal(What.isFalsey([[]]), false);
    });
    it("should return true for a falsey array", function() {
      assert.equal(What.isFalsey(["", null, 0, NaN, undefined, false]), true);
    });
    it("should return false for a non empty object", function() {
      assert.equal(What.isFalsey({
        "hello": "world"
      }), false);
    });
    it("should return false for a non empty array", function() {
      assert.equal(What.isFalsey(["hello"]), false);
    });
    it("should return false for 1", function() {
      assert.equal(What.isFalsey(1), false);
    });
    it("should return false for a string", function() {
      assert.equal(What.isFalsey("dfsdf"), false);
    });
  });

  describe('isEmpty', function() {
    it("should return false for false", function() {
      assert.equal(What.isEmpty(false), false);
    });
    it("should return true for null", function() {
      assert.equal(What.isEmpty(null), true);
    });
    it("should return false for 0", function() {
      assert.equal(What.isEmpty(0), false);
    });
    it("should return true for undefined", function() {
      assert.equal(What.isEmpty(undefined), true);
    });
    it("should return true for NaN", function() {
      assert.equal(What.isEmpty(NaN), true);
    });
    it("should return true for empty string", function() {
      assert.equal(What.isEmpty(""), true);
    });
    it("should return true for a empty string with spaces", function() {
      assert.equal(What.isEmpty("        "), true);
    });

    it("should return true for an empty object", function() {
      assert.equal(What.isEmpty({

      }), true);
    });
    it("should return true for an empty array", function() {
      assert.equal(What.isEmpty([]), true);
    });
    it("should return false for an array of empty arrays", function() {
      assert.equal(What.isEmpty([[]]), false);
    });
    it("should return false for a falsey array", function() {
      assert.equal(What.isEmpty(["", null, 0, NaN, undefined, false]), false);
    });
    it("should return false for a non empty object", function() {
      assert.equal(What.isEmpty({
        "hello": "world"
      }), false);
    });
    it("should return false for a non empty array", function() {
      assert.equal(What.isEmpty(["hello"]), false);
    });
    it("should return false for 1", function() {
      assert.equal(What.isEmpty(1), false);
    });
    it("should return false for a string", function() {
      assert.equal(What.isEmpty("dfsdf"), false);
    });
  });

  describe('trim', function() {
    it("should return empty string for a string with space", function() {
      assert.equal(What.trim("          "), "");
    });
    it("should return empty string for a string with prefix and sufix space", function() {
      assert.equal(What.trim("     Hello     "), "Hello");
    });
    it("should return a trimed array by removing all falsey objects", function() {
      assert.deepEqual(What.trim(["", null, 0, NaN, undefined, false, "Hello"]), ["Hello"]);
    });
  });

  describe('prefixInArray', function() {
    it("should return a array of elements starts with H", function() {
      assert.deepEqual(What.prefixInArray(["Hello", "Hola", "Welcome"], "H"), ["Hello", "Hola"]);
    });
    it("should return a array of elements starts with H and ignore all falsey objects", function() {
      assert.deepEqual(What.prefixInArray(["Hello", "Hola", "Welcome", null, undefined, 0, false, NaN], "H"), ["Hello", "Hola"]);
    });
    it("should return an empty array if nothing matches", function() {
      assert.deepEqual(What.prefixInArray(["Wello", "Wola", "Welcome", null, undefined, 0, false, NaN], "H"), []);
    });
    it("should return the same array if query is not a string", function() {
      assert.deepEqual(What.prefixInArray(["Hello", "Hola", "Welcome"], undefined), ["Hello", "Hola", "Welcome"]);
    });
    it("should return the input if its not array", function() {
      assert.deepEqual(What.prefixInArray(null, undefined), null);
    });
    it("should return the same array if the query is empty", function() {
      assert.deepEqual(What.prefixInArray(["Hello", "Hola", "Welcome"], ""), ["Hello", "Hola", "Welcome"]);
    });
    it("should return the same array if the array has another array", function() {
      assert.deepEqual(What.prefixInArray(["Hello", "Hola", "Welcome", ["Hello"]], "H"), ["Hello", "Hola"]);
    });
  });
  describe('sufixInArray', function() {
    it("should return a array of elements ends with e", function() {
      assert.deepEqual(What.sufixInArray(["Hello", "Whole", "Welcome"], "e"), ["Whole", "Welcome"]);
    });
    it("should return a array of elements ends with e and ignore all falsey objects", function() {
      assert.deepEqual(What.sufixInArray(["Hello", "Whole", "Welcome", null, undefined, 0, false, NaN], "e"), ["Whole", "Welcome"]);
    });
    it("should return an empty array if nothing matches", function() {
      assert.deepEqual(What.sufixInArray(["Wello", "Wola", "Welcome", null, undefined, 0, false, NaN], "s"), []);
    });
    it("should return the same array if query is not a string", function() {
      assert.deepEqual(What.sufixInArray(["Hello", "Hola", "Welcome"], undefined), ["Hello", "Hola", "Welcome"]);
    });
    it("should return the input if its not array", function() {
      assert.deepEqual(What.sufixInArray(null, undefined), null);
    });
    it("should return the same array if the query is empty", function() {
      assert.deepEqual(What.sufixInArray(["Hello", "Hola", "Welcome"], ""), ["Hello", "Hola", "Welcome"]);
    });
    it("should return the same array if the array has another array", function() {
      assert.deepEqual(What.sufixInArray(["Hello", "Whole", "Welcome", ["Hello"]], "e"), ["Whole", "Welcome"]);
    });
  });

  describe('findInArray', function() {
    it("should return an array of elements which contains el", function() {
      assert.deepEqual(What.findInArray(["Hello", "Whole", "Welcome"], "el"), ["Hello", "Welcome"]);
    });
    it("should return an array of elements which contains el and ignore all falsey objects", function() {
      assert.deepEqual(What.findInArray(["Hello", "Whole", "Welcome", null, undefined, 0, false, NaN], "el"), ["Hello", "Welcome"]);
    });
    it("should return an empty array if nothing matches", function() {
      assert.deepEqual(What.findInArray(["Wello", "Wola", "Welcome", null, undefined, 0, false, NaN], "z"), []);
    });
    it("should return the same array if query is not a string", function() {
      assert.deepEqual(What.findInArray(["Hello", "Hola", "Welcome"], undefined), ["Hello", "Hola", "Welcome"]);
    });
    it("should return the input if its not array", function() {
      assert.deepEqual(What.findInArray(null, undefined), null);
    });
    it("should return the same array if the query is empty", function() {
      assert.deepEqual(What.findInArray(["Hello", "Hola", "Welcome"], ""), ["Hello", "Hola", "Welcome"]);
    });
    it("should return the same array if the array has another array", function() {
      assert.deepEqual(What.findInArray(["Hello", "Whole", "Welcome", ["Hello"]], "el"), ["Hello", "Welcome"]);
    });
  });

  describe('for', function() {
    it("should loop through if its an array", function(done) {
      What.for([1], function(key, item, items) {
        done();
      });
    });
    it("should loop through if its an object", function(done) {
      What.for({"key": "value"}, function(key, item, items) {
        done();
      });
    });
    it("should throw type error if object is Undefined", function(done) {
      assert.throws(function() {
        What.for(undefined, done);
        done();
      }, /Unexpected type/);
    });
    it("should return undefined for undefined callback", function() {
      assert.equal(What.for(undefined, undefined), undefined);
    });
  });

});
