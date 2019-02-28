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
        .then(getModuleFor(name));
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
    function applyDefWith(deps) {
        try{
            return define.apply(NIL, deps);
        } catch(e) {
            console.error(e);
            if (name) {
                throw 'Error while defining module ' + name;
            }
        }
    }
    function defineModuleWith(deps) {
        return isFunction(define)?
            applyDefWith(deps):
            define;
    }
    var prom = new Promise(function(give, fail) {
        Promise.all(dep)
            .then(defineModuleWith)
            .then(give, /*or*/ fail);
    });
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
