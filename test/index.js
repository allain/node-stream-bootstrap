var assert = require('assert');

var streamify = require('stream-array');
var writable = require('writable');
var through = require('through2').obj;

var bootstrap = require('..');

describe('stream-bootstrap', function() {
  it('supports bootstrapping to Writable streams', function(done) {
    streamify(['a', 1]).pipe(bootstrap(function(data, encoding, cb) {
      cb(null, writable({objectMode: true}, function(chunk, encoding) {
        assert.equal(chunk, 1);
        done();
      }));
    }));
  });

  it('supports bootstrapping to Duplex streams', function(done) {
    streamify(['a', 1, 2]).pipe(bootstrap(function(data, encoding, cb) {
      cb(null, through(function(chunk, enc, cb) {
        //assert.equal(chunk, 1);
        this.push(chunk);
        cb();
      }));
    })).pipe(through(function(chunk, enc, cb) {
      assert.equal(chunk, 1);
      done();
    }));
  });

  it('supports retaining the first chunk', function(done) {
    streamify(['first', 'bob']).pipe(bootstrap(function(first, enc, cb) {
      var stream = through(function(chunk, enc, cb) {
        this.push('hi ' + chunk);
        cb();
      });
      stream.push(first);
      cb(null, stream);
    })).pipe(through(function(chunk, enc, cb) {
      assert.equal(chunk, 'first');
      done();
    }));
  });

  // Skipped until I can figure out how to intercept the error properly
  it.skip('emits error if no stream generated', function(done) {
    streamify(['a', 1]).pipe(bootstrap(function(data, encoding, cb) {
      cb();
    })).on('error', function(err) {
      assert(err, 'expected error');
      done();
    });
  });
});
