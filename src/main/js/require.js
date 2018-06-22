var Promise = require('../../main/js/Promise'),
    isPromise = Promise.isPromise,
    NIL,
    RE_PROVIDE = /^provide:/;
var main = (function(modules) {
	   modules = {};
	   function retrieveDep(name) {
	   	    if (!modules[name]) { throw 'No module "' + name + '" provided'; }
	   	    return modules[name];
	   }
	   var mainPromiseResolver,
	       mainPromise;
    function execute(name,dep,define) {
    	    if (RE_PROVIDE.test(name)) {
    	     	   name = name.replace(RE_PROVIDE, '');
    	    } else {
    	    	    // this case represents a simple use
    	    	    // not a definition
    	    	    // => do not support promises
    	    	    define = dep;
    	    	    dep = name;
    	    	    name = NIL;
    	    }
    	    var definition;
    	    if (typeof dep === 'function') {
    	    	   define = dep;
    	    	   dep = [];
    	    } else if (Array.isArray(dep)) {
    	    	   dep = dep.map(retrieveDep);
    	    } else {
    	    	   dep = [retrieveDep(dep)];
	        }
	        dep = [mainPromise].concat(dep);
	        function onDepsReadyExec(deps) {
	        	   return define.apply(NIL, deps);
	        }
	        function onDepsError(err) {
	            console.log(err);
	        }
	        var allDepsReady = Promise.all(dep, 'all_' + name + '_deps');
	        if (name) {
	        	   function definitionResolver(fulfill, reject) {
	        	   	    allDepsReady
	        	   	        .then(onDepsReadyExec)
	                    .then(function definitionResolve(definition) {
	                        console.log('> Defined ' + name);
	       	                 fulfill(definition);
	                    })
	                    .or(reject);
	        	   	}
	        	   modules[name] = new Promise(definitionResolver, name + 'Promise');
	        } else {
	        	   allDepsReady
	                .then(onDepsReadyExec)
	                .or(onDepsError);
	        }
    }
    mainPromiseResolver = function mainPromiseResolver(fulfill) {
    	   fulfill(execute);
	   };
	   mainPromise = new Promise(mainPromiseResolver, 'mainDep');
    return execute;
}());

module.exports = main;
