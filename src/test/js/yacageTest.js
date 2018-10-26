/*global module */
var test = module.require('./test');
var Promise = module.require('../../main/js/Promise');
var cage = module.require('../../main/js/yacage');

EMULATED_REMOTE = {
    'pawa': function pawa() {
           cage(
           'provide:pawa',
           function powerDefine(core) {
                return function power(a, n) {
                    var r = 1;
                    while (n--) {
                           r *= a;
                    }
                    return r;
               };
        });
  }
};
EMULATED_CACHE = {
    'substract': function substractLoader() {
           cage(
           'provide:substract',
           function substractDefine(core) {
                return function substract(a, b) {
                    return a - b;
               };
        });
  }
};
function emulatedLoad(name) {
    if (EMULATED_CACHE[name]) {
        return EMULATED_CACHE[name]();
    }
       return new Promise(function loadPromiseDef(resolve, reject) {
            setTimeout(function delayedEmulatedFile() {
                   try{
                      resolve(EMULATED_REMOTE[name]());
                   } catch(e) {
                      reject(e + ' [name=' + name + ']');
                   }
            }, 1000);
        });
}
cage.setExternalLoad(emulatedLoad);

cage(
       'provide:adder',
       function addDefine(core) {
           return function add(a, b) {
                return a + b;
           };
    });

test('require adder', function(a) {
    cage(
        ['adder'],
        function simpleUse1(core, add) {
            a.equals(add(42, 43), 85, '42+43 => 85');
            a.end();
        });
});

test('require subtract', function(a) {
    cage(
           ['subtract'],
           function simpleRemove(core, substrat) {
            a.equals(subtract(8, 3), 5, '8-3 => 5');
            a.end();
        });
});

cage(
       'provide:multiplier',
       function multDefine(core) {
           return function mult(a, b) {
                return a * b;
           };
    });

test('require multiplier', function(a) {
    cage(
           ['multiplier'],
           function simpleUse2(core, mult) {
            a.equals(mult(3, 9), 27, '3x9 => 27');
            a.end();
        });
});

test('require adder&multiplier', function(a) {
    cage(
           ['adder', 'multiplier'],
           function simpleUse3(core, add, mult) {
            a.equals(add(4, 6), 10, '4+6 => 10');
            a.equals(mult(4, 6), 24, '4x6 => 24');
            a.end();
        });
});

test('require adder&multiplier&divide', function(a) {
    cage(
           ['adder', 'multiplier', 'divid'],
           function simpleUse4() {
                a.fail();
        }, function(err) {
               a.equals(err.indexOf('Dependency Error'), 0, 'Should receive a dependency error');
               a.end();
        });
});

test('require calc', function(a) {
    cage(
         'provide:calc',
           ['adder', 'substract', 'multiplier', 'pawa'],
           function calcDefine(core, add, sub, mult, power) {
               return {
                    add: add,
                    sub: sub,
                    mult: mult,
                    power: power,
                    sqr: function square(x) {
                           return power(x, 2);
                    }
                };
        });
    a.pass('started to provide Calc module');
    cage(
           'calc',
           function calcUse1(core, calc) {
                a.equals(calc.add(3, 6), 9, '3 et 6 : 9');
            a.equals(calc.sub(47, 5), 42, '47-5 : 42');
            a.equals(calc.mult(4, 7), 28, '4 x 7 : 28');
            a.equals(calc.power(8, 0), 1, '8 ^ 0 : 1');
            a.equals(calc.power(12, 1), 12, '12 ^ 1 : 12');
            a.equals(calc.power(7, 2), 49, '7 ^ 2 : 49');
            a.equals(calc.power(3, 3), 27, '3 ^ 3 : 27');
            a.equals(calc.sqr(11), 121, '11^2 : 121');
            a.end();
            });
        });
