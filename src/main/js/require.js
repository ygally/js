var main = (function(modules) {
	   modules = {};
	   var NULL,
	       window,
	       RE_PROVIDE = /^provide:/;
	   function retrieveDep(name) {
	   	    if (!modules[name]) { throw 'No module "' + dep + '" provided'; }
	   	    return modules[name];
	   }
    function core(name, dep, define) {
    	    if (RE_PROVIDE.test(name)) {
    	     	   name = name
    	     	        .replace(RE_PROVIDE, '');
    	    } else {
    	    	    define = dep;
    	    	    dep = name;
    	    	    name = NULL;
    	    }
    	    var definition;
    	    if (typeof dep === 'function') {
    	    	    define = dep;
    	    	    definition = define(core);
    	    } else if (Array.isArray(dep)) {
    	    	    definition = define.apply(window, [core].concat(dep.map(retrieveDep)));
    	    } else {
	            definition = define(core,
	       	        retrieveDep(dep));
	        }
	       	if (name && definition) {
	       		   modules[name] = definition;
	       	}
    }
    return core;
}());

module.exports = main;