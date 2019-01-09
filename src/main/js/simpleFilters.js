/*global module*/
var cage = module.require('./yacage');
cage('provide:simpleFilters', function simpleFiltersDefinition() {
	   	var managers = [],
	       managerMap = {},
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
    function SimpleFilter(name, accept) {
        this.name = name;
        this.accept = accept;
        this.index = [];
    }
    function buildManager(name, dbg) {
        var filters = [],
	       	    filterMap = {},
	   	        originals = [];
	       function originalFromIndex(i) {
            return originals[i];
        }
        function originalsFrom(indexArray) {
            return indexArray && indexArray.map(originalFromIndex);
        }
        function names(name) {
	           var list = filters.map(extractNameOf);
	   	        if (!name) { return list; }
	           name = new RegExp('^' + name + ':');
	           return list.filter(matches.bind(NIL, name));
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
	       function createIfNotExists(name, accept) {
	           if (!filterMap[name]) {
	           	    create(name, accept);
	           	    return true;
	           }
	           return false;
	       }
	       function createIndexes(object, i) {
	       	    filters.forEach(function createBasicIndex(f) {
	       	        if (f.accept(object)) {
	       	            f.index.push(i);
	       	        }
	       	    });
	       	}
	       	function resetOne(filtr) {
	       	    filtr.index = [];
	       }
	       function initWith(objects) {
	       	    originals = objects;
	       	    filters.forEach(resetOne);
	       	    objects.forEach(createIndexes);
	       	}
	       function remove(name) {
	           if (!filterMap.hasOwnProperty(name)) {
	       	        throw 'removeFilter(): unknown filter ' + name;
	           	}
	           	removeFrom(filters, filterMap[name]);
	           	delete filterMap[name];
	       }
	       function indexesFor(f) {
	       	    return (filterMap[f] || EMPTY).index;
	       	}
	       function objectsFor(f) {
	       	    return originalsFrom(indexesFor(f));
	       	}
	       var manager = {
	       	    "name": name,
	       	    "create": create,
	       	    "createIfNotExists": createIfNotExists,
	       	    "remove": remove,
	       	    "names": names,
	       	    "initWith": initWith,
	       	    "indexesFor": indexesFor,
	       	    "objectsFor": objectsFor
	       	};
	       	managers.push(manager);
	       	managerMap[name] = manager;
	       	return manager;
    }
    var simpleFilters = buildManager('main');
    simpleFilters["build"] = buildManager;
    return simpleFilters;
});
