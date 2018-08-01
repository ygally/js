var yareq = require('../../main/js/require');

yareq(
	   'provide:filters',
	   function filtersDefinition(core) {
	   	    var filters = [];
	   	    var filterMap = {};
	   	    var originals = [];
	   	    function resetOne(filtr) {
	   	        filtr.index = [];
	       }
	       function originalFromIndex(i) {
            return originals[i];
        }
        function originalsFrom(indexArray) {
            return indexArray.map(originalFromIndex);
        }
	       function create(name, accept) {
            var f = {
                "name": name,
                "accept": accept,
                "index": []
            };
            filters.push(f);
            filterMap[name] = f;
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
	       	    filters.forEach(resetOne);
	       	    originals.forEach(createIndexes);
	       	}
	       	function indexesFor(name) {
	       	    return filterMap[name].index;
	       	}
	       	function objectsFor(name) {
	       	    return originalsFrom(filterMap[name].index);
	       	}
	       return {
	       	    "create": create,
	       	    "initWith": initWith,
	       	    "indexesFor": indexesFor,
	       	    "objectsFor": objectsFor
	       	};
	   });