var requoya = require('../../main/js/require');
requoya(
	   'provide:adder',
	   function addDefine(core) {
	       return function add(a, b) {
	 	         return a + b;
	       };
    });
requoya(
  	 ['adder'],
  	 function simpleUse1(core, add, mult) {
	     	 console.log('42 + 43 => ' + add(42, 43));
   });
requoya(
	   'provide:multiplier',
	   function multDefine(core) {
	       return function mult(a, b) {
	 	          return a * b;
	       };
    });
requoya(
  	 ['adder', 'multiplier'],
  	 function simpleUse1(core, add, mult) {
	     	 console.log('4 + 6 => ' + add(4, 6));
	  	    console.log('4 * 6 => ' + mult(4, 6));
   });
requoya(
	   'provide:pawa',
	   function powerDefine(core) {
	   	    return new Promise(function(giveDef) {
	           setTimeout(giveDef.bind(undefined, function power(a, n) {
	       	        var r = 1;
	       	        while (n--) {
	       	        	   r *= a;
	       	        }
	       	        return r;
	           }), 2000);
	       });
    });
requoya(
  	 'provide:calc',
	   ['adder', 'multiplier', 'pawa'],
	   function calcDefine(core, add, mult, power) {
	       return {
	       	    add: add,
	       	    mult: mult,
	       	    power: power
	       	};
    });
requoya(
	   'calc',
	   function calcUse1(core, calc) {
        console.log("3 et 6 : " + calc.add(3, 6));
        console.log("4 x 7 : " + calc.mult(4, 7));
        console.log("8^0 : " + calc.power(8, 0));
        console.log("12^2 : " + calc.power(12, 2));
        console.log("3^3 : " + calc.power(3, 3));
    });