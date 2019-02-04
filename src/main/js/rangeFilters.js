/*
	 FIXME 004 : add support for intersection and union of filters index (for filters combinations)
*/

/*global module*/
var cage = module.require('./yacage');
cage(
        'provide:rangeFilters',
	       ['arrays', 'sorts'],
	       function rangeFiltersDefinition(arrays, sorts) {
    var getter = arrays.getter,
        binarySearch = arrays.binarySearch,
        massIsolator = arrays.massIsolator,
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
    function lowerThanExtractor(searcher, array, value) {
        return array.slice(0, searcher(value));
    }
    function greaterThanExtractor(searcher, array, value) {
        return array.slice(searcher(value));
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
    	   this.index = NIL;
	       this.isolated = NIL;
    }
	   function buildManager(name, dbg) {
	   	    name = name || 'manager-' + managers.length + '-' + (+new Date);
	   	    var originals = [],
	   	        ranges = [],
	   	        rangeMap = {};
	   	    function originalFromIndex(i) {
            return originals[i];
        }
        function originalsFrom(indexArray) {
            return indexArray && indexArray.map(originalFromIndex);
        }
	       function names(prefix) {
	       	    return ranges.map(extractNameOf);
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
	       function initRange(isolateFromOriginals, fRange) {
	       	    fRange.isolated = isolateFromOriginals(fRange.name, fRange.getValue);
	       	    fRange.isolated.sort(comparator.by(fRange.name));
	       	    fRange.index = fRange.isolated.map(getter.of('i'));
	       	    var indexOfMore = binarySearch.strictlyMore.bind(NIL, fRange.isolated, fRange.name);
	           var indexOfMoreOrEqual = binarySearch.moreOrEqual.bind(NIL, fRange.isolated, fRange.name);
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
	       	    initRangeFromOriginals = initRange.from(massIsolator.from(objects));
	       	    ranges.forEach(initRangeFromOriginals);
	       	}
	       	function indexesFor(f) {
	       	    return (rangeMap[f] || EMPTY).index;
	       	}
	       	function objectsFor(f) {
	       	    var indexes = indexesFor(f);
	       	    var objects = originalsFrom(indexes);
	       	    objects.before = function before(v) { return originalsFrom(indexes.before(v)); };
	       	    objects.max = function max(v) { return originalsFrom(indexes.max(v)); };
	       	    objects.after = function after(v) { return originalsFrom(indexes.after(v)); };
	       	    objects.min = function min(v) { return originalsFrom(indexes.min(v)); };
	       	    objects.between = function between(first, last) {
	       	        return last === NIL?
	                   { "and": function betweenAnd(veryLast) { return originalsFrom(indexes.between(first, veryLast)); }}:
	                   originalsFrom(indexes.between(first, last));
	       	    };
	       	    return objects;
	       	}
	       var manager = {
	       	    "name": name,
	       	    "names": names,
	       	    "create": createRange,
	       	    "initWith": initWith,
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
