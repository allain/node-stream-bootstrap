# stream-bootstrap

A stream which wires itself up based on the first data it receives. Like building an airplain while it's flying.

[![build status](https://secure.travis-ci.org/allain/node-stream-bootstrap.png)](http://travis-ci.org/allain/node-stream-bootstrap)

## Installation

This module is installed via npm:

``` bash
$ npm install stream-initilizer
```

## Example Usage

``` js
var streamify = require('stream-array');
var through = require('through2').obj;
var stdout = require('stdout');

var bootstrap = require('stream-bootstrap');

var boostrapper = bootstrap(function (chunk, enc, cb) {
  if (chunk === '+') {
    var total = 0;
    return cb(null, through(function(chunk, enc, cb) {
      total += chunk;
      this.push(total);
      cb();
    });
  } else if (chunk === '*') {
    var product = 0;
    return cb(null, through(function(chunk, enc, cb) {
      product *= chunk
      this.push(product);
      cb();
    });
  }
});

streamify(['+', 1, 2, 3, 4]).pipe(bootstraper).pipe(stdout());
//=> 1 3 6 10

streamify(['*', 1, 2, 3, 4]).pipe(bootstraper).pipe(stdout());
//=> 1 2 6 24
```

## Retaining the first chunk
```js
streamify(['keep']).pipe(bootstrap(function(chunk, enc, cb) {
  var stream = ...;

  stream.write(chunk);

  cb(null, stream);
}))
```
