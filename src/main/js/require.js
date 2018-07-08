var Promise = require('../../main/js/Promise'),
    NIL,
    RE_PROVIDE = /^provide:/;
function defaultRemoteLoad(name) {
	   throw 'No module "' + name + '" provided';
}
var main = (function(remoteLoad, modules, downloads) {
	   modules = {};
	   downloads = {};
	   function onDepsError(err) {
	       console.log('dependency error: ' + err);
	       return Promise.reject(err);
	   }
	   function retrieveDep(name) {
	   	    if (!modules[name]) {
	   	    	   if (!downloads[name]) {
	   	    	   	    downloads[name] = Promise.resolve(remoteLoad(name));
	   	    	   	}
	   	    	   return downloads[name]
	   	    	      .then(function afterDL() {
	   	    	      	    return modules[name];
	   	    	      	}).or(onDepsError);
	   	    }
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
	        	   //console.log('after resolved ' + deps.length + ' deps' + (name? ' [' + name + ']': ''));
	        	   return define.apply(NIL, deps);
	        }
	        var allDepsReady = Promise.all(dep, 'all_' + name + '_deps');
	        //console.log('deps resolver promise : ' + allDepsReady.name);
	        if (name) {
	        	   //console.log('providing ' + name + '... ' + dep.length + ' deps');
	        	   function definitionResolver(fulfill, reject) {
	        	   	    allDepsReady
	        	   	        .then(onDepsReadyExec)
	                    .then(function definitionResolve(definition) {
	                        //console.log('> Defined ' + name);
	       	                 fulfill(definition);
	                    })
	                    .or(reject);
	        	   	}
	        	   modules[name] = new Promise(definitionResolver, name + 'Promise');
	        } else {
	        	   //console.log('simple execution... ' + dep.length + ' deps');
	        	   allDepsReady
	                .then(onDepsReadyExec)
	                .or(onDepsError);
	        }
    }
    mainPromiseResolver = function mainPromiseResolver(fulfill) {
    	   fulfill(execute);
	   };
	   mainPromise = new Promise(mainPromiseResolver, 'mainDep');
	   execute.setRemoteLoader = function setRemoteLoader(rl) {
	   	    remoteLoad = rl;
	   	};
    return execute;
}(defaultRemoteLoad));
if (module) {
    module.exports = main;
}
