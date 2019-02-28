/*global module*/
var cage = module.require('./yacage');
cage(
        'provide:filters',
        ['arrays', 'simpleFilters', 'groupFilters', 'rangeFilters'],
        function filtersDefinition(arrays, simpleFLib, groupFLib, rangeFLib) {
	   	var managers = [],
	   	    managerMap = {},
	   	    union = arrays.union,
	   	    intersection = arrays.intersection,
	   	    isArray = Array.isArray,
	   	    forEach = [].forEach,
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
	       	function ifArray(array, other) {
	           return isArray(array)?
	               array: other;
	       }
	       function throwIfHas(name) {
	           return function throwIf(lib, name) {
	               if (typeof lib.has === 'function' && lib.has(name)) {
	                   throw 'Lib "' + Lib.name + '" already has that filter : ' + name;
	               }
	           };
	       }
	       function uniq(create) {
	           return function createIfNotExist(name, settings) {
	               libs.forEach(throwIfHas(name));
	               create(name, settings)
	           };
	       }
	       function confToParams(conf) {
	           return [
	               conf.name,
	               conf.accept || conf.property
	          ];
	       }
	       function fromConf(create) {
	           return function createFromConf(conf) {
	               create.apply(NIL, confToParams(conf));
	           };
	       }
	       function multiple(create) {
	           var createFromConf = fromConf(create);
	           return function createMultiple(filters) {
	               if (isArray(filters)) {
	                   filters.forEach(createFromConf);
	               } else {
	                   create.apply(NIL, arguments);
	               }
	       	    };
	       	}
	       function initWith(objects) {
	       	    originals = objects;
	       	    simples.initWith(objects);
	       	    groups.initWith(objects);
	       	    ranges.initWith(objects);
	       	}
	       	function indexesForOne(f) {
	       	    return simples.indexesFor(f)
	       	        || groups.indexesFor(f)
	       	        || ranges.indexesFor(f)
	       	        || [];
	       }
	       function indexesUnion(names) {
	       	    return map.call(names, indexesForOne)
	       	        .reduce(union);
	       }
	       function chain(indexes) {
	           if (indexes) {
	               indexes.and = function intersectionWith(others) {
	                   others = indexesUnion(ifArray(others, arguments));
	                   return chain(intersection(indexes, others));
	               };
	               indexes.toOriginals = function indexesToOriginals() {
	                   return originalsFrom(indexes);
	               };
	           }
	           return indexes;
	       }
	       function indexesFor(filters) {
	           var indexes = indexesUnion(ifArray(filters, arguments));
	           return chain(indexes);
	       }
	       function objectsFor(filters) {
	           var indexes = indexesUnion(ifArray(filters, arguments));
	           return originalsFrom(indexes);
	       }
	       var manager = {
	       	    "name": name,
	       	    "names": names,
	       	    "create": multiple(uniq(simples.create)),
	       	    "byProperty": multiple(uniq(groups.create)),
	       	    "createRange": multiple(uniq(ranges.create)),
	       	    "initWith": initWith,
	       	    "valuesOf": groups.valuesOf,
	       	    "indexesFor": indexesFor,
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
