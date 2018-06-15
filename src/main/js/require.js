var main = (function(dependencies) {
	   dependencies = {};
	   var window,
	       NULL,
	       RE_PROVIDE = /^provide:/;
	   function retrieveDep(name) {
	   	    if (!dependencies[name]) { throw 'No module "' + dep + '" provided'; }
	   	    return dependencies[name];
	   }
    function main(name, dep, define) {
    	    if (RE_PROVIDE.test(name)) {
    	     	   name = name
    	     	        .replace(RE_PROVIDE, '');
    	    } else {
    	    	    define = dep;
    	    	    dep = name;
    	    	    name = NULL;
    	    }
    	    var deps, definition;
    	    if (typeof dep === 'function') {
    	    	    define = dep;
    	    	    definition = define(main);
    	    } else if (dep
    	 && Array.isArray(dep)) {
    	    	    definition = define.apply(window, [main].concat(dep.map(retrieveDep)));
    	    } else {
	            definition = define(main,
	       	        retrieveDep(dep));
	        }
	       	if (name && definition) {
	       		   dependencies[name] = definition;
	       	}
    }
    return main;
}());

main(
	  'provide:ev.hello',
	  function(ev) {
	  	   function world() {
	 	        console.log('hello world');
	      }
	      return { world: world };
    });
    
main(
	  'provide:ev.deux',
	  function(ev) {
	  	   function show(name) {
	 	        console.log('Yo '+(name||'Deux'));
	      }
	      return { show: show };
    });

main(
	  ['ev.hello', 'ev.deux'],
	  function(ev, hello, deux) {
	      hello.world();
	      hello.world();
	      	deux.show('toto');
    });

main(
	  'provide:ev.full',
	  ['ev.hello', 'ev.deux'],
	  function(ev, hello, deux) {
	      return {
	      	    hello: hello.world,
	      	    deux: deux.show
	      	};
    });
  
// another file
main(
   	'ev.full',
	  function(ev, full) {
	      full.hello();
	      full.deux();
    });
