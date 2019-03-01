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
    load,
    isArray = Array.isArray;
function isString(s) {
    return typeof s == 'string';
}
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
function newModFrom(name, dependencies, define) {
    function applyDefWith(deps) {
        try{
            return define.apply(NIL, deps);
        } catch(e) {
            console.error(e);
            throw 'Error while running ' + name;
        }
    }
    function defineModuleWith(deps) {
        return isFunction(define)?
            applyDefWith(deps):
            define;
    }
    return new Promise(function(give, fail) {
        Promise.all(dependencies.map(retrieveDep))
            .then(defineModuleWith)
            .then(give, /*or*/ fail);
    });
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
    if (modules[name]) {
        return Promise.reject('Tried to provide an already defined module [' + name + ']');
    }
    if (isString(dep)) {
        dep = [dep];
    } else if (!isArray(dep)) {
        define = dep;
        dep = [];
    }
    var prom = newModFrom(name||'no-name', dep, define);
    if (name) {
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
