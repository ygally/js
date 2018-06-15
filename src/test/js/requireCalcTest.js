var requoya = require('../../main/js/require');

requoya(
	  'provide:adder',
	  function(core) {
	      return {
	      	    add: function(a, b) {
	 	            return a + b;
	          }
	      };
    });
    
requoya(
	  'provide:multiplier',
	  function(core) {
	      return {
	      	   mult: function(a, b) {
	 	           return a * b;
	         }
	      };
    });

requoya(
	  ['adder', 'multiplier'],
	  function(core, a, m) {
	  	    console.log('4 + 6 => ' + a.add(4, 6));
	  	    console.log('4 * 6 => ' + m.mult(4, 6));
    });

requoya(
	  'provide:calc',
	  ['adder', 'multiplier'],
	  function(core, a, m) {
	      return {
	      	    add: a.add,
	      	    mult: m.mult
	      	};
    });
  
// another file
requoya('calc', function(core, calc) {
	     console.log("3 et 6 : " + calc.add(3, 6));
	  	  console.log("4 x 7 : " + calc.mult(4, 7));
    });
