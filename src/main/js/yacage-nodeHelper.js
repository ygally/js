/*global module*/
var cage = module.require('./yacage'),
    Promise = module.require('./Promise');
function isFunction(f) {
    return typeof f == 'function';
}
function resolveAsData(func) {
    return new Promise(function(resolve) {
        return resolve(func);
    });
}
function provide(name, definition) {
    cage('provide:' + name, definition)
        .or(function onModuleFailed(err) {
            console.error('Module "' + name + '" failed to load with "module.require()"', err);
        });
}
function define(name) {
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
function load(name) {
    var def = define(name);
    if (def && (Object.keys(def).length
            || isFunction(def))) {
        def = resolveAsData(def);
        if (!cage.has(name)) {
            provide(name, def);
        }
    }
    return def;
}
cage.setExternalLoad(load);
