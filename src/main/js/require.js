var Promise = require('./Promise'),
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
	   function defineModuleWith(deps) {
	       try{
	       	    return define.apply(NIL, deps);
	       	} catch(e) {
	       		   console.error('Error while defining/executing module ' + (name? '"' + name + '" ': ''), e);
	       	}
	   }
	   var allDepsReady = Promise.all(dep, 'all_' + name + '_deps');
	   if (name) {
	       function definitionResolver(resolve, reject) {
	        	   allDepsReady
	        	   	   .then(defineModuleWith)
	               .then(function definitionResolve(definition) {
	                   resolve(definition);
	               })
	               .or(reject);
	       	}
	       modules[name] = new Promise(definitionResolver, name + 'Promise');
	   } else {
	       allDepsReady
	           .then(defineModuleWith)
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