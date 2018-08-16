/*
	 FIXME 002 : allow more than 1 init call
	 FIXME 003 : add range filters (times, prices, and other numerical values)
*/
var yareq = require('../../main/js/require');

yareq('provide:filters', function filtersDefinition(core) {
	   	var managers = [],
	   	    managerMap = {};
	   function addManager(name) {
	   	    var filters,
	   	        filterMap,
	   	        groups,
	   	        groupMap,
	   	        originals;
	   	    name = name || 'manager-' + managers.length + '-' + (+new Date);
	   	    function resetAll() {
	   	        filters = [];
	   	        filterMap = {};
	   	        groups = [];
	   	        groupMap = {};
	   	        originals = [];
	   	    }
	   	    resetAll();
	   	    function resetOne(filtr) {
	   	        filtr.index = [];
	       }
	       function resetOneGroup(g) {
	   	        g.values = [];
	       }
	       function originalFromIndex(i) {
            return originals[i];
        }
        function originalsFrom(indexArray) {
            return indexArray && indexArray.map(originalFromIndex);
        }
	       function create(name, accept) {
	       	    if (!name) {
	       	        throw 'create(): need name for filter';
	       	    }
	       	    if (filterMap[name]) {
	       	        throw 'create(): filter already exists for name "' + name + '"';
	       	    }
            var f = {
                "name": name,
                "accept": accept,
                "index": []
            };
            filters.push(f);
            filterMap[name] = f;
            //console.log('created filter', f.name);
	       }
	       function isFunction(f) {
            return typeof f === 'function';
        }
	       function createByProperty(prefix, property) {
	       	    if (!prefix) {
	       	        throw 'createByProperty(): need name prefix for filter group';
	       	    }
	       	    if (groupMap[prefix]) {
	       	        throw 'createByProperty(): filter group already exists for prefix "' + prefix + '"';
	       	    }
	       	    property = property || prefix;
	       	    var getValue = property;
	       	    if (!isFunction(getValue)) {
	       	        //console.log('creating property retriever for "' + property + '"');
	       	    	   getValue = function getValue(o) {
	       	    	   	    return o[property];
	       	        };
	       	    }
	       	    fGroup = {
	       	        "prefix": prefix,
	       	        "getValue": getValue,
	       	        "values": []
	       	    };
	       	    groups.push(fGroup);
            groupMap[prefix] = fGroup;
            //console.log('created filter group ' + fGroup.prefix + ':...');
	       	}
	       function createGroupFiltersFrom(obj) {
	       	    function createIfNewForGroup(g) {
	       	        var value = g.getValue(obj),
	       	            name = g.prefix + ':' + value;
	       	        if (!filterMap[name]) {
	       	            g.values.push(value);
	       	            create(name, function acceptOneVal(o) {
	       	                return value === g.getValue(o);
	       	            });
	       	        }
	       	    }
	       	    groups.forEach(createIfNewForGroup);
	       	}
	       function createIndexes(object, i) {
	       	    filters.forEach(function createIndex(f) {
	       	        if (f.accept(object)) {
	       	            f.index.push(i);
	       	        }
	       	    });
	       	}
	       function initWith(objects) {
	       	    originals = objects;
	       	    groups.forEach(resetOneGroup);
	       	    originals.forEach(createGroupFiltersFrom);
	       	    filters.forEach(resetOne);
	       	    originals.forEach(createIndexes);
	       	}
	       	function names(prefix) {
	       	    var list = [];
	       	    prefix = prefix && new RegExp('^' + prefix + ':');
	       	    filters.forEach(function getNameOf(f) {
	       	        if (!prefix || prefix.test(f.name)) {
	       	            list.push(f.name);
	       	        }
	       	    });
	       	    return list;
	       	}
	       	function valuesOf(fGroup) {
	       	    fGroup = fGroup && groupMap[fGroup];
	       	    return fGroup && fGroup.values;
	       	}
	       	function indexesFor(f) {
	       	    f = f && filterMap[f];
	       	    return f && f.index;
	       	}
	       	function objectsFor(f) {
	       	    return originalsFrom(indexesFor(f));
	       	}
	       var manager = {
	       	    "name": name,
	       	    "reset": resetAll,
	       	    "create": create,
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
	   var mainInstance = addManager('main');
	   mainInstance["newInstance"] = addManager;
	   mainInstance["managers"] = function managerNames() {
	       return Object.keys(managerMap);
	   };
	   return mainInstance;
});
