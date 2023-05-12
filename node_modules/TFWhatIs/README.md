# WhatIs [![Build Status](https://travis-ci.org/mithralaya/WhatIs.svg?branch=master)](https://travis-ci.org/mithralaya/WhatIs)
A small util class.

> The plugin is only available for Node.JS currently.

##Install package

```js
npm install TFWhatIs
```
*TF stands for [Team First](http://teamfirstapp.com)*

##Include package

```js
var W = require('TFWhatIs');
```

##Functions available
  - [type](#type)
  - [trueType](#trueType)
  - [isNaN](#isNaN)
  - [isFalsey](#isFalsey)
  - [isEmpty](#isEmpty)
  - [trim](#trim)
  - [prefixInArray](#prefixInArray)
  - [sufixInArray](#sufixInArray)
  - [findInArray](#findInArray)
  - [for](#for)

####type:

Also checks for email, url, phone number(uses libphonenumber library), NaN, Float, Int and Infinity  types

```js
W.type("hello world"); //'String'
W.type(123); //'Int'
W.type(123.23); //'Float'
W.type(NaN); //'NaN'
W.type(Infinity); //'Number'
W.type(-Infinity); //'Number'
W.type({}); //'Object'
W.type(undefined); //'Undefined'
W.type([]); //'Array'
W.type(true); //'Boolean'
W.type(new Date()); //'Date'
W.type(null); //'Null'
W.type("test@test.com"); //'Email'
W.type("http://www.google.com/?q=testing"); //'Url'
W.type("+44 7700 900804"); //'Phone'
```

####trueType:

Just check for type and returns true javascript type for an object

```js
W.type("hello world"); //'String'
W.type(123); //'Number'
W.type(123.23); //'Number'
W.type(NaN); //'Number'
W.type(Infinity); //'Number'
W.type(-Infinity); //'Number'
W.type({}); //'Object'
W.type(undefined); //'Undefined'
W.type([]); //'Array'
W.type(true); //'Boolean'
W.type(new Date()); //'Date'
W.type(null); //'Null'
W.type("test@test.com"); //'String'
W.type("http://www.google.com/?q=testing"); //'String'
W.type("+44 7700 900804"); //'String'
```

####isNaN:
```js
W.isNaN(NaN); //true
W.isNaN(1312); //false
```

####isFalsey:

Even checks for empty object and array.

```js
W.isFalsey(false); //true
W.isFalsey(null); //true
W.isFalsey(0); //true
W.isFalsey(""); //true
W.isFalsey("   "); //true
W.isFalsey({}); //true
W.isFalsey([]); //true
W.isFalsey(undefined); //true
W.isFalsey(NaN); //true
W.isFalsey(["", null, 0, NaN, undefined, , false]); //true
```

####isEmpty:

Same as isFalsey but it returns false for false and 0. This helps to check required fields

```js
W.isEmpty(false); //false
W.isEmpty(null); //true
W.isEmpty(0); //false
W.isEmpty(""); //true
W.isEmpty("   "); //true
W.isEmpty({}); //true
W.isEmpty([]); //true
W.isEmpty(undefined); //true
W.isEmpty(NaN); //true
W.isEmpty(["", null, 0, NaN, undefined, , false]); //false
```

####trim:
```js
W.trim("          "); //""
W.trim("    hello   "); //"hello"
W.trim(["", null, 0, NaN, undefined, false, , "hello"]); //["hello"]
```

####prefixInArray:
```js
W.prefixInArray(["Hello", "Hola", "Welcome"], "H"); //["Hello", "Hola"]
W.prefixInArray(["Hello", "Hola", "Welcome", null, undefined, 0, false, NaN], "H"); //["Hello", "Hola"]);
W.prefixInArray(["Wello", "Wola", "Welcome", null, undefined, 0, false, NaN], "H"); //[]
W.prefixInArray(["Hello", "Hola", "Welcome"], undefined); //["Hello", "Hola", "Welcome"]
W.prefixInArray(null, undefined); //null
W.prefixInArray(["Hello", "Hola", "Welcome"], ""); //["Hello", "Hola", "Welcome"]
W.prefixInArray(["Hello", "Hola", "Welcome",["Hello"]], "H"); //["Hello", "Hola"]
```

####sufixInArray:
```js
W.sufixInArray(["Hello", "Hole", "Welcome"], "e"); //["Hole", "Welcome"]
W.sufixInArray(["Hello", "Hole", "Welcome", null, undefined, 0, false, NaN], "e"); //["Hole", "Welcome"]
W.sufixInArray(["Wello", "Wola", "Welcome", null, undefined, 0, false, NaN], "H"); //[]
W.sufixInArray(["Hello", "Hola", "Welcome"], undefined); //["Hello", "Hola", "Welcome"]
W.sufixInArray(null, undefined); //null
W.sufixInArray(["Hello", "Hola", "Welcome"], ""); //["Hello", "Hola", "Welcome"]
```

####findInArray:
```js
W.findInArray(["Hello", "Hola", "Welcome"], "el"); //["Hello", "Welcome"]
W.findInArray(["Hello", "Hola", "Welcome", null, undefined, 0, false, NaN], "el"); //["Hello", "Welcome"]);
W.findInArray(["Wello", "Wola", "Welcome", null, undefined, 0, false, NaN], "z"); //[]
W.findInArray(["Hello", "Hola", "Welcome"], undefined); //["Hello", "Hola", "Welcome"]
W.findInArray(null, undefined); //null
W.findInArray(["Hello", "Hola", "Welcome"], ""); //["Hello", "Hola", "Welcome"]
```

####for

does for in loop and checks for hasOwnProperty for both objects and arrays in one line.

```js
W.for([1, 2, 3, 4], function(index, item, items) {
  //do something
});
W.for({"key": "value"}, function(index, item, items) {
  //do something
});
W.for(undefined, function(index, item, items) {
  //do something
}); //throws an error 'Unexpected type'
W.for(undefined, undefined) // returns undefined
```

##LICENSE

The MIT License (MIT)

[Back to Top](#whatis-)
