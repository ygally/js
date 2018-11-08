/**
 * YaCage - Ya's Packager
 *
 * The Cage symbolizes a closed area, a scope.
 *
 * ----
 *
 * Needs Promise library to work fine.
 */

/*global module*/
var Promise = module.require('./Promise'),
    NIL,
    modules = {},
    downloads = {},
    RE_PROVIDE = /^provide:/,
    load;
function defaultLoad(name) {
    throw 'No module "' + name + '" provided';
}
function setExternalLoad(l) {
    load = l;
}
load = defaultLoad;
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
                   downloads[name] = Promise.resolve(load(name));
            }
            return downloads[name]
                   .then(function afterDL() {
                       return modules[name];
                   }).or(createDepErrorHandler());
       }
        return modules[name];
}
function cage(name, dep, define, fail) {
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
    function defineModuleWith(deps) {
        try{
            return define.apply(NIL, deps);
        } catch(e) {
            console.error('Error while defining/executing module ' + (name? '"' + name + '" ': ''), e);
        }
    }
    var allDepsReady = Promise.all(dep, 'all_' + name + '_deps');
    function definitionResolver(resolve, reject) {
        allDepsReady
            .then(defineModuleWith)
            .then(function definitionResolve(definition) {
                    resolve(definition);
                })
            .or(reject);
    }
    if (name) {
        if (modules[name]) {
            return Promise.reject('Tried to provide an already defined module [' + name + ']');
        }
        return (modules[name] = new Promise(definitionResolver, name + 'Promise'));
    } else {
        return allDepsReady
            .then(defineModuleWith)
            .or(createDepErrorHandler(fail));
    }
}
cage.setExternalLoad = setExternalLoad;
if (module) {
    module.exports = cage;
}