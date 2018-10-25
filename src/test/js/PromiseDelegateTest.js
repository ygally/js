/*global module */
var Promise = require('../../main/js/Promise');
var test = require('./test');

var NIL, isArray = Array.isArray;
function identity(x) { return x; }
function isString(s) {
    return typeof s === 'string';
}
function isFunction(f) {
    return typeof f === 'function';
}
function isObject(o) {
    o = typeof o;
    return o === 'object' || o === 'function';
}
function getFunction(f) {
    return isFunction(f)? f: identity;
}
function give(data) {
	   return function() {
	   	    return data;
    };
}

var map = Array.prototype.map;
var shift = Array.prototype.shift;

function wrapRequire(s){
  return {info: 'required '+s};
}
function wrapSimRequire(s){
  return {info: 'simRequired '+s};
}

// Gateway - general delegator 
// cybion() => resolve()
// cybion( Function [, Function] ) => res]
function cybion() {
    var args = map.call(arguments, identity);
    var cnt = args.length;
    var first = args[0];
    if (isArray(first)) {
        if (isString(first[0])) {
            // FIXME handle simRequire()
            first = first.map(wrapSimRequire);
        }
        // conv array of any to prom array
        // and send to all()
        return Promise.all(first.map(Promise.resolve));
        // FIXME Support multiple arrays
        // externalize for recurse poss
    }
    if (isString(first)) {
        // FIXME handle require()
        args = args.map(wrapRequire);
        first = args[0];
    }
    return cnt>1? Promise.seq(args): Promise.resolve(first);
}
function stringValueOf(d) {
    return d === NIL? 'undefined':
        (d === null? 'null': ''+d);
}
function willGive(d, tm, unit) {
    return Promise.wait(tm, unit).then(give(d));
}
function willReject(d, tm, unit) {
    return Promise.wait(tm, unit).then(give(Promise.reject(d)));
}

test('delegate0-array-empty', //{skip:1},
      function(a){
    cybion([]).then(function(r){
      a.equals(r.length, 0, 'Only result should be an empty array');
      a.end();
    }).or(a.fail.bind());
});

test('delegate0a-null', //{skip:1},
      function(a){
    cybion(null).then(function(r){
      a.equals(r, null,
         'Only result should be null');
      a.end();
    }).or(a.fail.bind());
});

test('delegate0b-undefined', //{skip:1},
      function(a){
    cybion(NIL).then(function(r){
      a.equals(r, NIL,
         'Only result should be undefined');
      a.end();
    }).or(a.fail.bind());
});

test('delegate0c-null-undefined', //{skip:1},
      function(a){
    cybion(null, give()).then(function(r){
      a.equals(r[0], null,
         'First result should be null');
      a.equals(r[1], NIL,
         '2nd result should be undefined');
      a.end();
    }).or(a.fail.bind());
});

test('delegate0d-undefined-null', //{skip:1},
      function(a){
    cybion(undefined, null).then(function(r){
      a.equals(r[0], NIL,
         'First result should be undefined');
      a.equals(r[1], null,
         '2nd result should be null');
      a.end();
    }).or(a.fail.bind());
});

test('delegate1-sim-undefined-null', //{skip:1},
      function(a){
    cybion([
        456, give(null), Promise.resolve()
    ]).then(function(r){
      a.equals(r[0], 456,
         'First result should be number 456');
      a.equals(r[1], null,
         '2nd result should be null');
      a.equals(r[2], undefined,
         '3rd result should be undefined');
      a.end();
    }).or(a.fail.bind());
});

test('delegate2-single-sequential-1s',
       //{skip:1},
      function(a){
    cybion(function(){
      return Promise.wait(1)
         .then(give('$money$'));
    }).then(function(r){
      a.equals(r, '$money$', 'Wrong after 1s');
      a.end();
    }).or(a.fail.bind());
});

test('delegate3-multi-sequential',
       //{skip:1},
      function(a){
cybion(give('1$'), give('2$'), give('3$'))
    .then(function (r){
      a.equals(
          r.join('+'),
          '1$+2$+3$',
          '3 seq should get 6$ ^^'
      );
      a.end();
   }).or(a.fail.bind());
});

test('delegate4-mult-seq-proms',
       //{skip:1},
      function(a){
  cybion(
      Promise.resolve(give('1$')),
      Promise.resolve(give('2$')),
      Promise.resolve(give('3$'))
  ).then(function (r){
      a.equals(
          Array.isArray(r), true,
          'seq resolved $ should get array of $'
      );
      r = r.join(',');
      a.equals(
          r,
          '1$,2$,3$',
          '3 seq resolved $ should get 6$ ^^'
      );
      a.end();
   }).or(a.fail.bind());
});

test('delegate5-mult-parallel-proms',
       //{skip:1},
      function(a){
  cybion([
      // first takes more time than others
      willGive('1$', 2),
      Promise.resolve(give('2$')),
      Promise.resolve(give('3$'))
  ]).then(function (r){
      a.equals(
          Array.isArray(r),
          true,
          'sim $ should get ordered array of $'
      );
      r = r.join(',');
      a.equals(
          r,
          '1$,2$,3$',
          '3 sim $ should get 6$ ^^'
      );
      a.end();
   }).or(a.fail.bind());
});

test('delegate6-mult-parallel-any',
       {skip:1},
      function(a){
  cybion([
      // mixed types of parallel processing
      willGive('5$', 500, 1),
      undefined,
      give('7.'),
      0,
      function() { return 'wala '+3.3; },
      null,
      '4$'
  ]).then(function (r){
      a.equals(
          Array.isArray(r),
          true,
          'simult any should get $ anyway'
      );
      a.equals(
          r.map(stringValueOf).join(','),
          '5$,undefined,7.,0,wala 3.3,null,4$',
          '6 sim things should get many $ ^^'
      );
      a.end();
   }).or(a.fail.bind());
});

test('delegate7-string-require', function(a){
  cybion('dep1', 'dep2', 'dep3')
         .then(function(r) {
      a.equals(r.length, 3, 'should retrieve 3 modules');
      a.equals(r[0] && r[0].info, 'required dep1', 'should get required mod1');
      a.equals(r[2] && r[2].info, 'required dep3', 'should get required mod3');
      a.end();
   }).or(a.fail.bind());
});

test('delegate8-string-sim-require', function(a){
  cybion(['dep1', 'dep2'])
         .then(function(r) {
      a.equals(r.length, 2, 'should retrieve 2 modules');
      a.equals(
       r[0] && r[0].info,
          'simRequired dep1',
         'should get simultaneously mod1'
      );
      a.equals(
       r[1] && r[1].info,
          'simRequired dep2',
         'should get simultaneously mod2'
      );
      a.end();
   }).or(a.fail.bind());
});

test('delegate9-race1', //{skip:1},
      function(a) {
    var p1 = willGive("un", .5);
    var p2 = willGive("deux", .1);
    Promise.race([p1, p2])
            .then(function(value) {
        a.equals(value, "deux",
          "Les deux promesses sont resolues mais p2 est plus rapide", 1);
        a.end();
    }, a.fail.bind());
});

test('delegate10-race2', //{skip:1},
       function(a){
    var p3 = willGive("trois", .1);
    var p4 = willReject("quatre", .5);
    Promise.race([p3, p4])
            .then(function(value) {
        a.equals(value, "trois",
          "p3 est plus rapide et a envoye une resolution pour la promesse de competition", 1);
        a.end();
    }, a.fail.bind());
});

test('delegate11-race3', //{skip:1},
       function(a){
    var p5 = willGive("cinq", .5);
    var p6 = willReject("six", .1);
    var p7 = willGive("sept", .8);
    p5.name = 'p5';
    p6.name = 'p6';
    p7.name = 'p7';
    Promise.race([p5, p6, p7])
            .then(a.fail.bind())
            .or(function(reason) {
        a.equals(reason, "six", "p6 est plus rapide et rejette la promesse de competition", 1);
        a.end();
    });
});
