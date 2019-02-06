/*global module*/
cage = module.require('./yacage');
function isFunction(f) {
    return typeof f == 'function';
}
function provideExternal(name, definition, moduleMap) {
    //console.log('providing Def for', name,
       //     '[', (definition && Object.keys(definition).length ||0),
       //     'props ; already exists?',!!moduleMap[name], '] :', definition);
    if (!moduleMap[name] && definition && (Object.keys(definition).length || isFunction(definition))) {
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
function loadViaRequire(name, moduleMap) {
    if (typeof moduleMap !== 'object') {
        throw 'Cannot find module list [module "' + name + '" cannot be loaded correctly]';
    }
    provideExternal(name, defineViaRequire(name), moduleMap);
}
cage.setExternalLoad(loadViaRequire);
