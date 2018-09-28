/*
	 FIXME 004 : add support for intersection and union of filters index (for filters combinations)
*/
var cage = require('./yacage'),
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
function binarySearch(isMore, data, index, getter, value, start, end) {
  var cnt = index.length, mid;
  if (start === NIL) {
    start = 0;
    end = cnt-1;
  }
  if (end - start < 2) {
  	  return isMore(getter(data[index[start]]), value)?
  	      start: 
  	      isMore(getter(data[index[end]]), value)?
  	          end:
  	          cnt;
  }
  mid = Math.floor((start + end) / 2);
  if (isMore(getter(data[index[mid]]), value)) {
    return Math.min(binarySearch(isMore, data, index, getter, value, start, mid-1), mid);
  }
  return binarySearch(isMore, data, index, getter, value, mid+1, end);
}
function isStrictlyMore(value, threshold) {
    return value > threshold;
}
function isMoreOrEqual(value, threshold) {
    return value >= threshold;
}
var binarySearchStrict = binarySearch.bind(NIL, isStrictlyMore);
var binarySearchIncluding = binarySearch.bind(NIL, isMoreOrEqual);
function lowerThanExtractor(searcher, array, value) {
    return array.slice(0, searcher(value));
}
function greaterThanExtractor(searcher, array, value) {
    return array.slice(searcher(value));
}
cage('provide:filters', function filtersDefinition(core) {
	   	var managers = [],
	   	    managerMap = {},
	   	    NIL;
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
	       function resetOneRange(fRange) {
	           fRange.index = [];
	           var firstIndexOfMore = binarySearchStrict.bind(NIL, originals, fRange.index, fRange.getValue);
	           var firstIndexOfMoreOrEqual = binarySearchIncluding.bind(NIL, originals, fRange.index, fRange.getValue);
	           fRange.index.before = lowerThanExtractor.bind(NIL, firstIndexOfMoreOrEqual, fRange.index);
	           fRange.index.after = greaterThanExtractor.bind(NIL, firstIndexOfMore, fRange.index);
	           fRange.index.min = greaterThanExtractor.bind(NIL, firstIndexOfMoreOrEqual, fRange.index);
	           fRange.index.max = lowerThanExtractor.bind(NIL, firstIndexOfMore, fRange.index);
	           fRange.index.between = function between(first, last) {
	               return last === NIL?
	                   {"and": function max(maxValue) {
	                       return fRange.index.slice(
	                           firstIndexOfMoreOrEqual(first),
	                           firstIndexOfMore(last)
	                       );
	                   }}:
	                   fRange.index.slice(
	                       firstIndexOfMoreOrEqual(first),
	                       firstIndexOfMore(last)
	                   );
	           };
	       }
	       function names(prefix) {
	       	    var list = filters.map(extractNameOf);
	       	    list = list.concat(ranges.map(extractNameOf));
	       	    if (!prefix) { return list; }
	       	    prefix = new RegExp('^' + prefix + ':');
	       	    return list.filter(matches.bind(NIL, prefix));
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
	   	        names(g.prefix).forEach(removeFilter);
	       }
	       function resetAll() {
	           groups.forEach(resetOneGroup);
	           filters.forEach(resetOne);
	           ranges.forEach(resetOneRange);
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
	       }
	       function createRange(name, property) {
	       	    if (!name) {
	       	        throw 'createRange(): need name for filter range';
	       	    }
	       	    if (rangeMap[name]) {
	       	        throw 'createRange(): filter range already exists for name "' + name + '"';
	       	    }
            property = property || name;
	       	    var getValue = property;
	       	    if (!isFunction(getValue)) {
	       	        getValue = function getValue(o) {
	       	    	   	    return o[property];
	       	        };
	       	    }
	       	    var fRange = {
	       	        "name": name,
	       	        "getValue": getValue,
	       	        "index": NIL
	       	    };
            ranges.push(fRange);
            rangeMap[name] = fRange;
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
	       	        getValue = function getValue(o) {
	       	    	   	    return o[property];
	       	        };
	       	    }
	       	    var fGroup = {
	       	        "prefix": prefix,
	       	        "getValue": getValue,
	       	        "values": []
	       	    };
	       	    groups.push(fGroup);
            groupMap[prefix] = fGroup;
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
	       function createBasicIndexes(object, i) {
	       	    filters.forEach(function createBasicIndex(f) {
	       	        if (f.accept(object)) {
	       	            f.index.push(i);
	       	        }
	       	    });
	       	}
	       	function createRangeIndexes(object, i) {
	       	    ranges.forEach(function createRangeIndex(fRange) {
	       	        fRange.index.push(i);
	       	    });
	       	}
	       	function createIndexes(object, i) {
	       	    createBasicIndexes(object, i);
	       	    createRangeIndexes(object, i);
	       	}
	       	function sortRange(fRange) {
	       	    function compare(i1, i2) {
	       	        i1 = originalFromIndex(i1);
	       	        i2 = originalFromIndex(i2);
	       	        i1 = fRange.getValue(i1);
	       	        i2 = fRange.getValue(i2);
	       	        return i1<i2? -1: (i1>i2? 1: 0);
	       	    }
	       	    fRange.index.sort(compare);
	       	}
	       function initWith(objects) {
	       	    originals = objects;
	       	    resetAll();
	       	    originals.forEach(createGroupFiltersFrom);
	       	    originals.forEach(createIndexes);
	       	    ranges.forEach(sortRange)
	       	}
	       	function valuesOf(fGroup) {
	       	    fGroup = fGroup && groupMap[fGroup];
	       	    return fGroup && fGroup.values;
	       	}
	       	function indexesFor(f) {
	       	    f = f && (filterMap[f] || rangeMap[f]);
	       	    return f && f.index;
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