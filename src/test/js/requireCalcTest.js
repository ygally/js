/*global module */
var Promise = require('../../main/js/Promise');
var requoya = require('../../main/js/require');
var test = require('./test');

EMULATED_FILES = {
 	'pawa': function pawa() {
		   requoya(
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

function emulatedLoad(name) {
	   return new Promise(function loadPromiseDef(resolve, reject) {
	   	    setTimeout(function delayedEmulatedFile() {
	   	    	   try{
	   	    	   	  resolve(EMULATED_FILES[name]());
	   	    	   } catch(e) {
	   	    	   	  reject(e + ' [name=' + name + ']');
	   	    	   }
	   	    }, 1000);
	   	});
}
requoya.setRemoteLoader(emulatedLoad);

requoya(
	   'provide:adder',
	   function addDefine(core) {
	       return function add(a, b) {
	       	    return a + b;
	       };
    });

test('require adder', function(a) {
    requoya(
        ['adder'],
        function simpleUse1(core, add) {
            a.equals(add(42, 43), 85, '42+43 => 85');
            a.end();
        });
});

requoya(
	   'provide:multiplier',
	   function multDefine(core) {
	       return function mult(a, b) {
	       	    return a * b;
	       };
    });

test('require multiplier', function(a) {
    requoya(
    	   ['multiplier'],
    	   function simpleUse2(core, mult) {
            a.equals(mult(3, 9), 27, '3x9 => 27');
            a.end();
        });
});

test('require adder&multiplier', function(a) {
    requoya(
    	   ['adder', 'multiplier'],
    	   function simpleUse3(core, add, mult) {
            a.equals(add(4, 6), 10, '4+6 => 10');
            a.equals(mult(4, 6), 24, '4x6 => 24');
            a.end();
        });
});

test('require adder&multiplier&divide', function(a) {
    requoya(
    	   ['adder', 'multiplier', 'divid'],
    	   function simpleUse4() {
    	   	    a.fail();
        }, function(err) {
        	   a.equals(err.indexOf('Dependency Error'), 0, 'Should receive a dependency error');
        	   a.end();
        });
});

requoya(
  	 'provide:calc',
	   ['adder', 'multiplier', 'pawa'],
	   function calcDefine(core, add, mult, power) {
	       return {
	       	    add: add,
	       	    mult: mult,
	       	    power: power,
	       	    sqr: function square(x) {
	       	    	   return power(x, 2);
	       	    }
	       	};
    });

test('require calc', function(a) {
    requoya(
	       'calc',
	       function calcUse1(core, calc) {
	       	    a.equals(calc.add(3, 6), 9, '3 et 6 : 9');
            a.equals(calc.mult(4, 7), 28, '4 x 7 : 28');
            a.equals(calc.power(8, 0), 1, '8 ^ 0 : 1');
            a.equals(calc.power(12, 1), 12, '12 ^ 1 : 12');
            a.equals(calc.power(7, 2), 49, '7 ^ 2 : 49');
            a.equals(calc.power(3, 3), 27, '3 ^ 3 : 27');
            a.equals(calc.sqr(11), 121, '11^2 : 121');
            a.end();
	   	    });
	   	});