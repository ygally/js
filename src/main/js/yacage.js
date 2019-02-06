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
    EMPTY = {},
    load;
function isFunction(f) {
    return typeof f == 'function';
}
function setExternalLoad(extLoad) {
    load = extLoad;
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
            downloads[name] = Promise.resolve(load(name, modules));
        }
        return downloads[name]
            .then(function afterDL() {
                return modules[name];
            }).or(createDepErrorHandler());
    }
    return modules[name];
}
function cage(name, dep, define, fail, settings) {
    if (RE_PROVIDE.test(name)) {
        name = name.replace(RE_PROVIDE, '');
        //console.log('try to provide '+name);
    } else {
        // this case represents a simple use
        // not a definition
        settings = fail;
        fail = define;
        define = dep;
        dep = name;
        name = NIL;
        //console.log('using deps :', dep);
    }
    var definition;
    if (Array.isArray(dep)) {
        dep = dep.map(retrieveDep);
    } else if (typeof dep == 'string') {
        dep = [retrieveDep(dep)];
    } else {
        settings = fail;
        fail = define;
        define = dep;
        dep = [];
    }
    //console.log('deps promises :', dep);
    function defineModuleWith(deps) {
        //console.log('resolved deps :', deps);
        try{
            return isFunction(define)?
                define.apply(NIL, deps): define;
        } catch(e) {
            console.error('Error while defining/executing module ' + (name? '"' + name + '" ': ''), e);
        }
    }
    var allDepsReady = Promise.all(dep, 'all_' + name + '_deps');
    function definitionResolver(resolve, reject) {
        allDepsReady
            .then(defineModuleWith)
            .then(resolve)
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
load = function defaultLoad(name) {
    throw 'No external loading is defined [module "' + name + '" not found]';
};
cage.setExternalLoad = setExternalLoad;
if (module) {
    module.exports = cage;
}
