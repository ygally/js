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
                   downloads[name] = Promise.resolve(load(name));
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
    } else {
        // this case represents a simple use
        // not a definition
        settings = fail;
        fail = define;
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
        settings = fail;
        fail = define;
        define = dep;
        dep = [];
    }
    var isDataDefinition = (settings||EMPTY).type == 'data';
    function defineModuleWith(deps) {
        try{
            return (typeof define != 'function'
                    || isDataDefinition)? define:
                define.apply(NIL, deps);
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
function provideExternal(name, definition) {
    if (definition && Object.keys(definition).length) {
        cage(
                'provide:' + name,
                definition,
                function onNodeModuleFailed2(err) {
                    console.error('Module "' + name + '" failed (2) to load with "module.require()"', err);
                },
                {type: 'data'})
        .or(function onNodeModuleFailed(err) {
            console.error('Module "' + name + '" failed to load with "module.require()"', err);
        });
    }
}
load = function defaultLoad(name) {
    var definition;
    try {
        provideExternal(name, module.require('./' + name));
    } catch(e) {
        console.error(e);
        try {
            provideExternal(name, module.require('../../test/js/' + name));
        } catch(e2) {
            console.error(e2);
            throw 'Failed to load module "' + name + '" with "module.require()"';
        }
    }
};
cage.setExternalLoad = setExternalLoad;
if (module) {
    module.exports = cage;
}
