/*
	 FIXME 004 : add support for intersection and union of filters index (for filters combinations)
*/

/*global module*/
var cage = module.require('./yacage');
cage(
        'provide:groupFilters',
	       ['simpleFilters', 'arrays', 'sorts'],
	       function groupFiltersDefinition(simpleFiltersLib, arrays, sorts) {
    var getter = arrays.getter,
        comparator = sorts.comparator,
	       	EMPTY = {},
        NIL,
        managers = [],
	   	    managerMap = {};
	   	function removeFrom(array, e) {
        array.splice(array.indexOf(e), 1);
    }
    function matches(prefix, text) {
        return prefix.test(text);
    }
    function extractNameOf(object) {
        return object.name;
    }
    function isFunction(f) {
        return typeof f === 'function';
    }
    function GroupOfFilters(name, property) {
	       var getValue = property;
	       if (!isFunction(getValue)) {
	           	getValue = getter.of(property);
	       }
	       this.name = name;
    	   this.getValue = getValue;
	       this.values = [];
    	   this.index = NIL;
	       this.isolated = NIL;
    }
	   function buildManager(name, dbg) {
	   	    name = name || 'manager-' + managers.length + '-' + (+new Date);
	   	    var simpleFilters = simpleFiltersLib.build(name + '_spl', dbg),
	   	        groups = [],
	   	        groupMap = {},
	   	        originals = [];
	   	    function originalFromIndex(i) {
            return originals[i];
        }
        function originalsFrom(indexArray) {
            return indexArray && indexArray.map(originalFromIndex);
        }
	       function names(prefix) {
	       	    return simpleFilters.names(prefix);
	       	}
	       function resetOneGroup(g) {
	   	        g.values = [];
	   	        names(g.name).forEach(simpleFilters.remove);
	       }
	       function createByProperty(name, property) {
	       	    if (!name) {
	       	        throw 'createByProperty(): need name for filter group';
	       	    }
	       	    if (groupMap[name]) {
	       	        throw 'createByProperty(): filter group already exists for name "' + name + '"';
	       	    }
	       	    var fGroup = new GroupOfFilters(name, property || name);
	       	    groups.push(fGroup);
            groupMap[name] = fGroup;
	       	}
	       function createGroupFiltersFrom(obj) {
	       	    function createIfNewForGroup(g) {
	       	        var value = g.getValue(obj),
	       	            name = g.name + ':' + value;
	       	        if (simpleFilters.createIfNotExists(name, function acceptOneVal(o) {
	       	                return value === g.getValue(o);
	       	            })) {
	       	            g.values.push(value);
	       	        }
	       	    }
	       	    groups.forEach(createIfNewForGroup);
	       	}
	       function initWith(objects) {
	       	    originals = objects;
	       	    groups.forEach(resetOneGroup);
	       	    objects.forEach(createGroupFiltersFrom);
	       	    simpleFilters.initWith(objects);
	       	}
	       	function valuesOf(fGroup) {
	       	    return (groupMap[fGroup] || EMPTY).values;
	       	}
	       	function indexesFor(f) {
	       	    return simpleFilters.indexesFor(f) || (rangeMap[f] || EMPTY).index;
	       	}
	       	function objectsFor(f) {
	       	    return originalsFrom(indexesFor(f));
	       	}
	       var manager = {
	       	    "name": name,
	       	    "names": names,
	       	    "byProperty": createByProperty,
	       	    "initWith": initWith,
	       	    "valuesOf": valuesOf,
	       	    "indexesFor": indexesFor,
	       	    "objectsFor": objectsFor
	       	};
	       	managers.push(manager);
	       	managerMap[name] = manager;
	       	return manager;
	   }
	   var mainInstance = buildManager('main');
	   mainInstance["build"] = buildManager;
	   mainInstance["managers"] = function managerNames() {
	       return Object.keys(managerMap);
	   };
	   return mainInstance;
});
