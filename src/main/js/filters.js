/*
	 FIXME 004 : add support for intersection and union of filters index (for filters combinations)
*/
var yareq = require('../../main/js/require');

function removeFrom(array, e) {
    array.splice(array.indexOf(e), 1);
}
function matches(prefix, text) {
    return prefix.test(text);
} 
function extractNameOf(object) {
    return object.name;
}

yareq('provide:filters', function filtersDefinition(core) {
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
        function before(fRange, value) {
            // FIXME use dichotomy! 
            var i,
                orig,
                index = fRange.index,
                getValue = fRange.getValue,
                accepted = [];
            for (i=0; i<index.length; ++i) {
                orig = originalFromIndex(index[i]);
                orig = getValue(orig);
                if (orig < value) {
                    accepted.push(index[i]);
                }
            }
            return accepted;
        }
        function after(fRange, value) {
            // FIXME use dichotomy! 
            var i,
                orig,
                index = fRange.index,
                getValue = fRange.getValue,
                accepted = [];
            for (i=0; i<index.length; ++i) {
                orig = originalFromIndex(index[i]);
                orig = getValue(orig);
                if (orig > value) {
                    accepted.push(index[i]);
                }
            }
            return accepted;
        }
	       function max(fRange, value) {
            // FIXME use dichotomy! 
            var i,
                orig,
                index = fRange.index,
                getValue = fRange.getValue,
                accepted = [];
            for (i=0; i<index.length; ++i) {
                orig = originalFromIndex(index[i]);
                orig = getValue(orig);
                if (orig <= value) {
                    accepted.push(index[i]);
                }
            }
            return accepted;
        }
        function min(fRange, value) {
            // FIXME use dichotomy! 
            var i,
                orig,
                index = fRange.index,
                getValue = fRange.getValue,
                accepted = [];
            for (i=0; i<index.length; ++i) {
                orig = originalFromIndex(index[i]);
                orig = getValue(orig);
                if (orig >= value) {
                    accepted.push(index[i]);
                }
            }
            return accepted;
        }
        function between(fRange, v1, v2) {
            // FIXME use dichotomy! 
            var i,
                orig,
                index = fRange.index,
                getValue = fRange.getValue,
                accepted = [];
            for (i=0; i<index.length; ++i) {
                orig = originalFromIndex(index[i]);
                orig = getValue(orig);
                if (orig >= v1 && (v2 === NIL || orig <= v2)) {
                    accepted.push(index[i]);
                }
            }
            if (v2 === NIL) {
                accepted.and = function and(out_v2) {
                    var finalAccepted = [];
                    for (i=0; i<accepted.length; ++i) {
                        orig = originalFromIndex(accepted[i]);
                        orig = getValue(orig);
                        if (orig <= out_v2) {
                            finalAccepted.push(accepted[i]);
                        }
                    }
                    return finalAccepted;
                };
            }
            return accepted;
        }
	       function resetOne(filtr) {
	   	        filtr.index = [];
	       }
	       function resetOneRange(fRange) {
	           fRange.index = [];
	           fRange.index.before = before.bind(NIL, fRange);
	           fRange.index.after = after.bind(NIL, fRange);
	           fRange.index.min = min.bind(NIL, fRange);
	           fRange.index.max = max.bind(NIL, fRange);
	           fRange.index.between = between.bind(NIL, fRange);
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
	       	        //console.log('createRange(): creating property retriever for "' + property + '"');
	       	    	   getValue = function getValue(o) {
	       	    	   	    return o[property];
	       	        };
	       	    }
	       	    var fRange = {
	       	        "name": name,
	       	        "getValue": getValue,
	       	        "index": NIL
	       	    };
	       	    resetOneRange(fRange);
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
	       	        //console.log('createByProperty(): creating property retriever for "' + property + '"');
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
