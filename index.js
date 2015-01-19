var debug= require('debug')('stream-bootstrap');

var Writable = require('stream').Writable;
var assert = require('assert');

var duplexer = require('duplexer');
var through = require('through2').obj;

module.exports = bootstrap;

function bootstrap(fn) {
  var bootstrapped = false;

  var input = noop();
  var output = noop();

  // Single serving stream that replaces itself based on the
  // value of the first chunk it receives
  var decider = new Writable();

  decider._write = function(chunk, encoding, cb) {
    input.unpipe(decider);

    fn(chunk, encoding, function(err, stream) {      
      if (err) return cb(err);

      if (!stream) {
        return cb(new Error('could not initialize next step'));
      }

      if (stream._read) {
        debug('wiring up duplex stream');
        // Wire the input and output to the new stream
        input.pipe(stream).pipe(output);
      } else {
        debug('generated stream is not readable, output will remain disconnected');
        input.pipe(stream);
      }

      return cb();
    });
  };

  input.pipe(decider);

  return duplexer(input, output);
}

// Just passes data through;
function noop(){
  return through(function(chunk,encoding,cb){
    return cb(null, chunk);
  });
}
