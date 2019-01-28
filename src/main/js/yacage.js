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
function provideExternal(name, definition) {
    //console.log('providing Def for', name,
       //     '[', (definition && Object.keys(definition).length ||0),
       //     'props ; already exists?',!!modules[name], '] :', definition);
    if (!modules[name] && definition && (Object.keys(definition).length || isFunction(definition))) {
        //console.log('got def :', definition);
        cage(
            'provide:' + name,
            new Promise(resolve => resolve(definition)),
            function onNodeModuleFailed2(err) {
                console.error('Module "' + name + '" failed (2) to load with "module.require()"', err);
               
            })
        .or(function onNodeModuleFailed(err) {
            console.error('Module "' + name + '" failed to load with "module.require()"', err);
        });
    }
}
function defineViaRequire(name) {
    try {
        return module.require('./' + name);
    } catch(e) {
        if (('' + e).indexOf('Cannot find module')<0) {
            console.info(e);
        }
        try {
        	   return module.require('../../main/js/' + name);
        } catch(e2) {
            if (('' + e2).indexOf('Cannot find module')<0) {
                console.info(e2);
            }
            try {
            	   return module.require('../../test/js/' + name);
            } catch(e3) {
                if (('' + e3).indexOf('Cannot find module')<0) {
                    console.info(e3);
                }
                throw 'Failed to load module "' + name + '" with "module.require()" [' + e + '] [' + e2 + '] [' + e3 + ']' ;
            }
        }
    }
}
load = function defaultLoad(name) {
    provideExternal(name, defineViaRequire(name));
};
cage.setExternalLoad = setExternalLoad;
if (module) {
    module.exports = cage;
}
