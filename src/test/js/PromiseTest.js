/*global module*/
var test = module.require('./test');
var Promise = module.require('../../main/js/Promise');
var NIL;
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
function give(data) { return function() { return data; }; }

var map = Array.prototype.map;
var shift = Array.prototype.shift;

var GLOBAL_DBG = 1;
var PFX = 'AUDITO ~~~ ';
// FIXME Ã erme utiliser auditorium
var utAud = {
  log: function(msg) {
     console.log(PFX+msg);
  },
  error: function(msg) {
     console.error(PFX+'ERROR: '+msg);
  }
};
function assertEquals(
       name, msg,
       expect, actual,
       debug) {
   if (expect !== actual) {
       expect = isString(expect)?
           '"'+expect+'"': expect;
       actual = isString(actual)?
           '"'+actual+'"': actual;
       utAud.error(name+': '
          +msg+' [[expect = <'
          +expect+'> AND got = <'
          +actual+'>]]'
       );
   } else if (GLOBAL_DBG || debug) {
       utAud.log(name+': PASSED');
   }
}
function pass(name, msg) {
   utAud.log(
       name+': PASSED'
       +(msg? ' ~~$ '+msg: '')
   );
}
function fail(name, msg) {
   utAud.error(
       name+': FAILED'
       +(msg? ' ~~! '+msg: '')
   );
}
function willFail(name, msg) {
  return fail.bind(NIL, name, msg);
}



// FIXME use "test" lib

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

var rnd0=Math.round(Math.random()*1e4);
var rnd1=Math.round(Math.random()*1e4);

function a0(ya) {   throw "arf0 "+rnd0; }
function a1(ya) {
   setTimeout(ya.bind(NIL, 'r1-'+rnd1), 2000);
}
function a2(ya) {
   setTimeout(ya.bind(NIL,"r2"), 1000);
}
function a3(ya) {
   setTimeout(ya.bind(NIL,"r3"), 3000);
}
function a4(ya) { ya("r4-vif"); }

var p0 = new Promise(a0, 'a0'),
    p1 = new Promise(a1, 'a1'),
    p2 = new Promise(a2, 'a2'),
    p3 = new Promise(a3, 'a3'),
    p4 = new Promise(a4, 'a4');

test('P00', function(a) {
    new Promise(function(ya) {
        throw "r00";
    }, 'a00').done(
        	a.fail.bind(a, 'should be rejected'),
        function(r) {
            a.equals(r, 'r00', 'should catch r00');
            a.end();
        });
    });

test('P01', function(a) {
    new Promise(function(ya) {
        setTimeout(ya.bind(NIL, 'd01-'+rnd1), 500);
    }, 'a01').done(function(d) {
            a.equals(d, 'd01-'+rnd1, 'should be d01 rdm');
            a.end();
        }, a.fail.bind());
    });

test('P2', function(a) {
    p2.done(function (r){
            a.equals(r, 'r2', 'should be r2');
            a.end();
        }, a.fail.bind());
    });


test('resolve', function(a){
    Promise.resolve().then(function (r){
            a.equals(r, undefined,
            	'Unattended val');
            a.end();
        }, a.fail.bind());
    });

test('all none', function(a){
    Promise.all().done(function(r) {
            a.equals(r.length, 0,
            	'attended empty array');
            a.end();
        }, a.fail.bind());
    });

test('all empty', function(a){
    Promise.all([]).done(function(r) {
            a.equals(r.length, 0,
            	'attended empty array');
            a.end();
        }, a.fail.bind());
    });

test('all one', function(a){
    Promise.all([p1]).done(function(r) {
            a.equals(r[0], 'r1-'+rnd1,
            	"all should have one result");
            a.end();
        }, a.fail.bind());
    });

test('all two', function(a){
    Promise.all([p1, p2]).done(function(r) {
            a.equals(r.join('+'), 'r1-'+rnd1+'+r2',
            	"all1+2 should have 2 results");
            a.end();
        }, a.fail.bind());
    });

test('all four', function(a){
    Promise.all([p2, p3, p4, p1]).done(function(r) {
            a.equals(r.join('+'), 'r2+r3+r4-vif+r1-'+rnd1,
            	"all1>4 should have 4 results");
            a.end();
        }, a.fail.bind());
    });
    
test('all three fail', function(a){
    Promise.all([p2, p0, p1])
        .done(a.fail.bind('all 3 should have failed'), function(e) {
            a.equals(e, "arf0 "+rnd0,
            	"all 3 should have failed with specific error 'arf0 "+rnd0+"'");
            a.end();
        });
    });

p3.then(function() {
        return p4;
        }).then(function(d4) {
            return "Good4{"+d4+"}";
            }, function(e4) {
            return "Err4{"+e4+"}";
            }).done(function(result) {
                assertEquals('YG12',
                        'should be good',
                        'Good4{r4-vif}', result);
                });

function showX(x) {
    return 'x=' + x;
}


Promise.resolve(function() {
        return 'Res toto';
        })
.then(showX)
    .done(function(data) {
            assertEquals(
                    'TRes1', 'resolve value is wrong',
                    'x=Res toto', data
                    );
            });

Promise.resolve((function(x, y) {
            return 'Res '+x+', '+y;
            }).bind(NIL, 'titi', 'tata'))
.then(showX)
    .done(function(data) {
            assertEquals(
                    'TRes2', 'resolve value is wrong',
                    'x=Res titi, tata', data
                    );
            });

test('PT01',function(a) {
    var p002 = new Promise(function(ya){ya(1);});
    p002.then(function(v) {
        a.equals(v, 1, 'should start at 1');
        return v + 1;
    }).then(function(v) {
        a.equals(v, 2, 'should go to 2');
        p002.then(function(v) {
            a.equals(v, 1, 'should end on 1');
            a.end();
        }).or(a.fail.bind());
    }).or(a.fail.bind());
});

Promise.resolve()
    .then(function() {
            throw 'Oh My God!';
            })
.then(function() {
        fail('PT02');
        }, function(err) {
        assertEquals(
                'PT02', 'should throw OMG!',
                'Oh My God!', err);
        });

    Promise.reject()
.then(give(99), give(42))
    // rejet rÃ©lu avec 42
    .then(function(soluce) {
            assertEquals(
                    'PT03', 'rejection should result on 42',
                    42, soluce);
            });

Promise.resolve()
    .then(function() {
            throw 'Oh My God!';
            })
.catch(function(err) {
        assertEquals(
                'PT04.1', 'should throw OMG!',
                'Oh My God!', err);
        return 'catched';
        })
.then(function(endData) {
        assertEquals(
                'PT04.2', 'should be catched',
                'catched', endData);
        });


function resoudrePlusTard(ya) {
    setTimeout(function() { ya(10); }, 1000);
}
function romprePlusTard(ya, no) {
    setTimeout(function() { no(20); }, 1000);
}
var pr1 = Promise.resolve("toto");
var pr2 = pr1.then(function() {
        // On renvoie une nouvelle promesse
        // qui sera rÃ©lue avec la valeur 10
        // au bout d 1 seconde
        return new Promise(resoudrePlusTard);
        });
pr2.then(function(v) {
        assertEquals('PT05.1',
                'should be ten',
                10, v);
        }, function(e) {
        // not called
        fail('PT05.0');
        });

var pr3 = pr1.then(function() {
        // Ici, on renvoie une promesse
        // qui sera rompue avec la valeur
        // 20 au bout d une seconde
        return new Promise(romprePlusTard);
        });
pr3.then(function(v) {
        // pas appelÃ©
        fail('PT06.0');
        }, function(e) {
        assertEquals('PT06.1',
                'should be twenty',
                20, e);
        });