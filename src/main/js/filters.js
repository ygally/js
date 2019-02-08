/*
	 FIXME 004 : add support for intersection and union of filters index (for filters combinations)
*/

/*global module*/
var cage = module.require('./yacage');
cage(
        'provide:filters',
        ['arrays', 'simpleFilters', 'groupFilters', 'rangeFilters'],
        function filtersDefinition(arrays, simpleFLib, groupFLib, rangeFLib) {
	   	var managers = [],
	   	    managerMap = {},
	   	    union = arrays.union,
	   	    cross = arrays.intersection,
	   	    map = [].map,
	   	    NIL;
	   function buildManager(name, dbg) {
	   	    name = name || 'manager-' + managers.length + '-' + (+new Date);
	   	    var simples = simpleFLib.build(name + '_spl', dbg),
	   	        groups = groupFLib.build(name + '_grp', dbg),
	   	        ranges = rangeFLib.build(name + '_rng', dbg),
	   	        libs = [simples, groups, ranges],
	   	        originals = [];
	   	    function originalFromIndex(i) {
            return originals[i];
        }
        function originalsFrom(indexArray) {
            return indexArray && indexArray.map(originalFromIndex);
        }
	       function names(prefix) {
	       	    var list = simples.names(prefix);
	       	    list = list.concat(groups.names(prefix));
	       	    if (prefix) {
	       	        return list;
	       	    }
	       	    return list.concat(ranges.names(prefix));
	       	}
	       	function throwIfHas(name) {
	       	    return function throwIf(lib, name) {
	       	        if (typeof lib.has === 'function' && lib.has(name)) {
	       	            throw 'Lib "' + Lib.name + '" already has that filter : ' + name;
	       	        }
	       	    };
	       	}
	       	function wrapWithExistenceChecker(create) {
	       	    return function createIfNotExist(name, settings) {
	       	        libs.forEach(throwIfHas(name));
	       	        create(name, settings)
	       	    };
	       	}
	       function initWith(objects) {
	       	    originals = objects;
	       	    simples.initWith(objects);
	       	    groups.initWith(objects);
	       	    ranges.initWith(objects);
	       	}
	       	function indexesFor(f) {
	       	    return simples.indexesFor(f)
	       	        || groups.indexesFor(f)
	       	        || ranges.indexesFor(f);
	       }
	       function indexesUnion(names) {
	       	    return map.call(names, indexesFor)
	       	        .reduce(union);
	       }
	       function indexesForAll(filters) {
	           return Array.isArray(filters)?
	               indexesUnion(filters):
	               indexesUnion(arguments);
	       }
	       function objectsFor(f) {
	           return originalsFrom(indexesFor(f));
	       }
	       var manager = {
	       	    "name": name,
	       	    "names": names,
	       	    "create": wrapWithExistenceChecker(simples.create),
	       	    "byProperty": wrapWithExistenceChecker(groups.create),
	       	    "createRange": wrapWithExistenceChecker(ranges.create),
	       	    "initWith": initWith,
	       	    "valuesOf": groups.valuesOf,
	       	    "indexesFor": indexesForAll,
	       	    "objectsFor": objectsFor
	       	};
	       	managers.push(manager);
	       	managerMap[name] = manager;
	       	return manager;
	   }
	   var mainInstance = buildManager('shared');
	   mainInstance["build"] = buildManager;
	   mainInstance["managers"] = function managerNames() {
	       return Object.keys(managerMap);
	   };
	   return mainInstance;
});
