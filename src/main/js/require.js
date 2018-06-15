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

module.exports = main;