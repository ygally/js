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
    loading = {},
    RE_PROVIDE = /^provide:/,
    EMPTY = {},
    load;
function isFunction(f) {
    return typeof f == 'function';
}
function setExternalLoad(extLoad) {
    load = extLoad;
}
function handleDepError(err) {
    throw 'Dependency Error: ' + err;
}
function has(name) {
    return !!modules[name];
}
function getModuleFor(name) {
    return function getModule() {
        return modules[name];
    }
}
function loadDep(name) {
    if (!loading[name]) {
        loading[name] = Promise.resolve(load(name));
    }
    return loading[name]
        .then(getModuleFor(name), handleDepError);
}
function retrieveDep(name) {
    if (has(name)) {
        return modules[name];
    }
    return loadDep(name);
}
function cage(name, dep, define) {
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
    if (Array.isArray(dep)) {
        dep = dep.map(retrieveDep);
    } else if (typeof dep == 'string') {
        dep = [retrieveDep(dep)];
    } else {
        define = dep;
        dep = [];
    }
    function defineModuleWith(deps) {
        try{
            return isFunction(define)?
                define.apply(NIL, deps): define;
        } catch(e) {
            console.error('Error while defining/executing module ' + (name? '"' + name + '" ': ''), e);
        }
    }
    var allDepsReady = Promise.all(dep, 'all_' + (name||'') + '_deps');
    function definitionResolver(resolve, reject) {
        allDepsReady
            .then(defineModuleWith)
            .then(resolve, reject);
    }
    var prom = new Promise(definitionResolver, name + 'Promise');
    if (name) {
        if (modules[name]) {
            return Promise.reject('Tried to provide an already defined module [' + name + ']');
        }
        modules[name] = prom;
    }
    return prom;
}
load = function defaultLoad(name) {
    return Promise.reject('No external loading is defined [module "' + name + '" not found]');
};
cage.has = has;
cage.setExternalLoad = setExternalLoad;
if (module) {
    module.exports = cage;
}
