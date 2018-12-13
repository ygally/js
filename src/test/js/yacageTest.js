/*global module */
var test = module.require('./test');
var Promise = module.require('../../main/js/Promise');
var cage = module.require('../../main/js/yacage');

var EMULATED_REMOTE = {
    'pawa': function pawa() {
        cage(
            'provide:pawa',
            function powerDefine() {
                return function power(a, n) {
                    var r = 1;
                    while (n--) {
                           r *= a;
                    }
                    return r;
                };
            });
    },
    'substract': function substractLoader() {
        cage(
            'provide:substract',
            function substractDefine() {
                return function substract(a, b) {
                    return a - b;
                };
            });
    }
};
function emulatedLoad(name) {
    return new Promise(function loadPromiseDef(resolve, reject) {
        setTimeout(function delayedEmulatedFile() {
            try{
                EMULATED_REMOTE[name]();
                resolve();
            } catch(e) {
                reject(e + ' [name=' + name + ']');
            }
        }, 200);
    });
}
cage.setExternalLoad(emulatedLoad);

cage(
    'provide:adder',
    function addDefine() {
        return function add(a, b) {
            return a + b;
        };
    }
);

test('require adder', function(a) {
    cage(
        ['adder'],
        function simpleUse1(add) {
            a.equals(add(42, 43), 85, '42+43 => 85');
            a.end();
        });
});

test('verify double provide fail', a=>{
    cage(
        'provide:adder',
        function addDefine() {
            return function erroneousAdd(a, b) {
                return a + 2 * b;
            };
        }
    ).then(d => {
        a.fail('should throw an exception [' + d + ']');
        a.end();
    }).catch(e => {
        a.pass('exception ok : ' + e);
        a.end();
    });
});

test('require substract twice', function(a) {
    var t0 = +new Date;
    cage('substract', function simpleRemove(sub) {
        var t1 = +new Date;
        a.equals(sub(8, 3), 5, '8-3 => 5');
        a.equals(t1-t0>100, true, '1st dep should take long to load');
        var t2 = +new Date;
        cage('substract', function simpleRemove(sub2) {
            var t3 = +new Date;
            a.equals(sub2(14, 5), 9, '14-5 => 9');
            a.equals(t3-t2<100, true, '2nd dep should NOT take LONG (Cache)');
            a.end();
        });
    });
});

cage(
    'provide:multiplier',
    function multDefine() {
        return function mult(a, b) {
            return a * b;
        };
    });

test('require multiplier', function(a) {
    cage(
           ['multiplier'],
           function simpleUse2(mult) {
            a.equals(mult(3, 9), 27, '3x9 => 27');
            a.end();
        });
});

test('require adder&multiplier', function(a) {
    cage(
        ['adder', 'multiplier'],
        function simpleUse3(add, mult) {
            a.equals(add(4, 6), 10, '4+6 => 10');
            a.equals(mult(4, 6), 24, '4x6 => 24');
            a.end();
        });
});

test('require adder&multiplier&divide', function(a) {
    cage(
        ['adder', 'multiplier', 'divid'],
        a.fail,
        function(err) {
            a.equals(err.indexOf('Dependency Error'), 0, 'Should receive a dependency error');
            a.end();
        }
    ).then(e => e? a.fail(e): a.pass());
});

test('require calc', function(a) {
    cage(
        'provide:calc',
        ['adder', 'substract', 'multiplier', 'pawa'],
        function calcDefine(add, sub, mult, power) {
            return {
                add: add,
                sub: sub,
                mult: mult,
                power: power,
                sqr: function square(x) {
                    return power(x, 2);
                }
            };
        }
    );
    cage(
        'calc',
        function calcUse1(calc) {
            a.equals(calc.add(3, 6), 9, '3 et 6 : 9');
            a.equals(calc.sub(47, 5), 42, '47-5 : 42');
            a.equals(calc.mult(4, 7), 28, '4 x 7 : 28');
            a.equals(calc.power(8, 0), 1, '8 ^ 0 : 1');
            a.equals(calc.power(12, 1), 12, '12 ^ 1 : 12');
            a.equals(calc.power(7, 2), 49, '7 ^ 2 : 49');
            a.equals(calc.power(3, 3), 27, '3 ^ 3 : 27');
            a.equals(calc.sqr(11), 121, '11^2 : 121');
            a.end();
        }
    );
});

test('after define then', function(a) {
    cage(
        'provide:square2',
        'multiplier',
        mul => (a => mul(a, a))
    ).then(function useSquare(sqr) {
        a.equals(sqr(3), 9, '3 au carré : 9');
        a.end();
    }).or(a.fail);
});
