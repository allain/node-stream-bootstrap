var debug = require('debug')('stream-bootstrap');

var stream = require('stream');

var duplexer = require('duplexer');
var through = require('through2').obj;

module.exports = bootstrap;

function bootstrap(fn) {
  var bootstrapped = false;

  var input = new stream.PassThrough({objectMode: true});
  var output = new stream.PassThrough({objectMode: true});

  // Single serving stream that replaces itself based on the
  // value of the first chunk it receives
  var decider = new stream.Writable({objectMode: true});

  decider._write = function(chunk, encoding, cb) {
    input.unpipe(decider);

    fn(chunk, encoding, function(err, stream) {
      if (err) return cb(err);

      if (!stream) return cb(new Error('could not initialize next step'));

      if (stream._read) {
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
