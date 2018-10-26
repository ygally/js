/*
	 FIXME 004 : add support for intersection and union of filters index (for filters combinations)
*/

/*global module*/
var cage = module.require('./yacage'),
    arrays = module.require('./arrays'),
    sorts = module.require('./sorts'),
    getter = arrays.getter,
    binarySearch = arrays.binarySearch,
    massIsolator = arrays.massIsolator,
    comparator = sorts.comparator,
	   	EMPTY = {},
    NIL;
function removeFrom(array, e) {
    array.splice(array.indexOf(e), 1);
}
function matches(prefix, text) {
    return prefix.test(text);
} 
function extractNameOf(object) {
    return object.name;
}
function lowerThanExtractor(searcher, array, value) {
    return array.slice(0, searcher(value));
}
function greaterThanExtractor(searcher, array, value) {
    return array.slice(searcher(value));
}
function isFunction(f) {
    return typeof f === 'function';
}
	       
// simple filters
function SimpleFilter(name, accept) {
    this.name = name;
    this.accept = accept;
    this.index = [];
}

// group of filters
function GroupOfFilters(name, property) {
	   var getValue = property;
	   if (!isFunction(getValue)) {
	       	getValue = function getValue(o) {
	       	    return o[property];
	       	};
	   }
	   this.name = name;
	   this.getValue = getValue;
	   this.values = [];
	   this.index = NIL;
	   this.isolated = NIL;
}

cage('provide:filters', function filtersDefinition(core) {
	   	var managers = [],
	   	    managerMap = {};
	   function addManager(name) {
	   	    var filters = [],
	   	        filterMap = {},
	   	        groups = [],
	   	        groupMap = {},
	   	        originals = [],
	   	        ranges = [],
	   	        rangeMap = {};
	   	    name = name || 'manager-' + managers.length + '-' + (+new Date);
	   	    function originalFromIndex(i) {
            return originals[i];
        }
        function originalsFrom(indexArray) {
            return indexArray && indexArray.map(originalFromIndex);
        }
        function resetOne(filtr) {
	   	        filtr.index = [];
	       }
	       function names(name) {
	       	    var list = filters.map(extractNameOf);
	       	    list = list.concat(ranges.map(extractNameOf));
	       	    if (!name) { return list; }
	       	    name = new RegExp('^' + name + ':');
	       	    return list.filter(matches.bind(NIL, name));
	       	}
	       function removeFilter(name) {
	       	    if (!filterMap.hasOwnProperty(name)) {
	       	        throw 'removeFilter(): unknown filter ' + name;
	       	    }
	       	    removeFrom(filters, filterMap[name]);
	       	    delete filterMap[name];
	       }
	       function resetOneGroup(g) {
	   	        g.values = [];
	   	        names(g.name).forEach(removeFilter);
	       }
	       function resetAll() {
	           groups.forEach(resetOneGroup);
	           filters.forEach(resetOne);
	       }
	       function create(name, accept) {
	       	    if (!name) {
	       	        throw 'create(): need name for filter';
	       	    }
	       	    if (filterMap[name]) {
	       	        throw 'create(): filter already exists for name "' + name + '"';
	       	    }
            var f = new SimpleFilter(name, accept);
            filters.push(f);
            filterMap[name] = f;
	       }
	       function createRange(name, property) {
	       	    if (!name) {
	       	        throw 'createRange(): need name for filter range';
	       	    }
	       	    if (rangeMap[name]) {
	       	        throw 'createRange(): filter range already exists for name "' + name + '"';
	       	    }
            var fRange = new GroupOfFilters(name, property || name);
            ranges.push(fRange);
            rangeMap[name] = fRange;
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
	       	    filters.forEach(function createBasicIndex(f) {
	       	        if (f.accept(object)) {
	       	            f.index.push(i);
	       	        }
	       	    });
	       	}
	       	function initRange(isolateFromOriginals, fRange) {
	       	    fRange.isolated = isolateFromOriginals(fRange.name, fRange.getValue);
	       	    fRange.isolated.sort(comparator.by(fRange.name));
	       	    fRange.index = fRange.isolated.map(getter.of('i'));
	       	    var indexOfMore = binarySearch.strict.bind(NIL, fRange.isolated, fRange.name);
	           var indexOfMoreOrEqual = binarySearch.including.bind(NIL, fRange.isolated, fRange.name);
	           fRange.index.before = lowerThanExtractor.bind(NIL, indexOfMoreOrEqual, fRange.index);
	           fRange.index.after = greaterThanExtractor.bind(NIL, indexOfMore, fRange.index);
	           fRange.index.min = greaterThanExtractor.bind(NIL, indexOfMoreOrEqual, fRange.index);
	           fRange.index.max = lowerThanExtractor.bind(NIL, indexOfMore, fRange.index);
	           function betweenBounds(data, first, last) {
	           	    return data.slice(
	                   indexOfMoreOrEqual(first),
	                   indexOfMore(last)
	               );
	           	}
	           fRange.index.between = function between(first, last) {
	               return last === NIL?
	                   { "and": betweenBounds.bind(NIL, fRange.index, first) }:
	                   betweenBounds(fRange.index, first, last);
	           };
	       	}
	       	initRange.from = function initRangeFrom(propertyIsolator) {
	       	    return initRange.bind(NIL, propertyIsolator);
	       	};
	       function initWith(objects) {
	       	    originals = objects;
	       	    resetAll();
	       	    objects.forEach(createGroupFiltersFrom);
	       	    objects.forEach(createIndexes);
	       	    initRangeFromOriginals = initRange.from(massIsolator.from(objects));
	       	    ranges.forEach(initRangeFromOriginals);
	       	}
	       	function valuesOf(fGroup) {
	       	    return (groupMap[fGroup] || EMPTY).values;
	       	}
	       	function indexesFor(f) {
	       	    return (filterMap[f] || rangeMap[f] || EMPTY).index;
	       	}
	       	function objectsFor(f) {
	       	    return originalsFrom(indexesFor(f));
	       	}
	       var manager = {
	       	    "name": name,
	       	    "create": create,
	       	    "remove": removeFilter,
	       	    "names": names,
	       	    "byProperty": createByProperty,
	       	    "createRange": createRange,
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