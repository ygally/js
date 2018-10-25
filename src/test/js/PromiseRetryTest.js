/*global module */
var Promise = require('../../main/js/Promise');
var test = require('./test');

function $failer(n) {
    var failer = {r: n, d: 'failer'+n};
    return function oneFailOrSuccess() {
        if (failer.r--) {
         	  //console.log(failer.d+' failing');
            throw failer.d+'-error';
        }
        //console.log(failer.d+' working');
        return failer.d+'-ok';
    };
}
test('retry-and-pass', function(a){
  Promise.resolve($failer(2))
     .retry(2).then(function(r) {
        a.equals(
             r, 'failer2-ok',
             'should fail twice and finally pass'
         );
         /* FIXME find a sexy manner for retrieving ENCLOSING PROMISE last errors!
         a.equals(
             Object.keys(r)
                .map(stringValueOf).join(','),
             'data,errors',
             'should fail twice and finally pass'
         );
         a.equals(
             r.errors.length, 2,
             'should fail twice > 2 errors in result'
         );*/
        a.end();
     }).or(a.fail.bind());
});

test('retry-and-fail', function(a){
  Promise.resolve($failer(3))
     .retry(2).then(function(r) {
        a.fail('should fail 3 times & has been resolved: '+JSON.stringify(r));
     }).or(function(r) {
       a.equals(
          r.length, 3,
          'should fail thrice > 3 errors array'
       );
       a.equals(
       r[2],
          'failer3-error',
          'should get attended failer error'
      );
       a.end();
     });
});
