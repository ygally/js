var Promise = require('../../main/js/Promise'),
    NIL,
    modules = {},
	   downloads = {},
    RE_PROVIDE = /^provide:/;
function remoteLoad(name) {
	   throw 'No module "' + name + '" provided';
}
function createDepErrorHandler(fail) {
	   return fail? function handleDepError(err) {
	   	    fail(err);
	   	}: function handleDepError(err) {
	   	    throw 'Dependency Error: ' + err;
	   	};
}
function retrieveDep(name) {
	   if (!modules[name]) {
	   	    if (!downloads[name]) {
	   	    	   downloads[name] = Promise.resolve(remoteLoad(name));
	   	    }
	   	    return downloads[name]
	   	    	   .then(function afterDL() {
	   	    	       return modules[name];
	   	    	   }).or(createDepErrorHandler());
	   }
	   	return modules[name];
}
var mainPromiseResolver,
    mainPromise;
function main(name, dep, define, fail) {
    if (RE_PROVIDE.test(name)) {
     	   name = name.replace(RE_PROVIDE, '');
    } else {
    	   // this case represents a simple use
        // not a definition
        fail = define;
    	   define = dep;
    	   dep = name;
    	   name = NIL;
    }
    var definition;
    if (typeof dep === 'function') {
    	   fail = define;
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
	       function definitionResolver(resolve, reject) {
	        	   allDepsReady
	        	   	   .then(onDepsReadyExec)
	               .then(function definitionResolve(definition) {
	                   //console.log('> Defined ' + name);
	       	            resolve(definition);
	               })
	               .or(reject);
	       	}
	       modules[name] = new Promise(definitionResolver, name + 'Promise');
	   } else {
	       //console.log('simple execution... ' + dep.length + ' deps');
	       allDepsReady
	           .then(onDepsReadyExec)
	           .or(createDepErrorHandler(fail));
	   }
}
mainPromiseResolver = function mainPromiseResolver(resolve) {
 	  resolve(main);
};
mainPromise = new Promise(mainPromiseResolver, 'mainDep');
main.setRemoteLoader = function setRemoteLoader(rl) {
	   remoteLoad = rl;
};
if (module) {
    module.exports = main;
}