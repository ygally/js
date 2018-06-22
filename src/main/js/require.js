var Promise = require('../../main/js/Promise'),
    isPromise = Promise.isPromise,
    NIL,
    NULL,
    RE_PROVIDE = /^provide:/;
var main = (function(modules) {
	   modules = {};
	   function retrieveDep(name) {
	   	    if (!modules[name]) { throw 'No module "' + dep + '" provided'; }
	   	    return modules[name];
	   }
	   function core(name, deps, define) {
	   	    var definition = define.apply(NIL, deps);
	   	    if (name && definition) {
	       		   modules[name] = definition;
	       	}
	   }
    function execute(name,dep,define) {
    	    if (RE_PROVIDE.test(name)) {
    	     	   name = name
    	     	        .replace(RE_PROVIDE, '');
    	    } else {
    	    	    // this case represents a simple use
    	    	    // not a definition
    	    	    // => do not support promises
    	    	    define = dep;
    	    	    dep = name;
    	    	    name = NULL;
    	    }
    	    var definition;
    	    if (typeof dep === 'function' || name && isPromise(dep)) {
    	    	    define = dep;
    	    	    dep = [execute];
    	    } else if (Array.isArray(dep)) {
    	    	    dep = [execute].concat(dep.map(retrieveDep));
    	    } else {
    	    	    dep = [execute, retrieveDep(dep)];
	        }
	        core(name, dep, define);
	        return execute;
    }
    return execute;
}());

module.exports = main;