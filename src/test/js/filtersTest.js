/*global module */
var yareq = require('../../main/js/require');
var yatest = require('./test');

require('../../main/js/filters');

yatest('simple filters', function(a) {
    yareq(
        ['filters'],
        function simpleFilters(core, filters) {
            filters.create('matchA', o => o.name.indexOf('a') >= 0);
            filters.create('matchE', o => o.name.indexOf('e') >= 0);
            filters.create('matchR', o => o.name.indexOf('r') >= 0);
            var objects = [
                {name: 'spray'},
                {name: 'elite'},
                {name: 'present'}
            ];
        	   filters.initWith(objects);
        	   a.equals(filters.indexesFor('matchA').join("_"), "0");
        	   a.equals(filters.indexesFor('matchE').join("_"), "1_2");
        	   a.equals(filters.objectsFor('matchR').map(o=>o.name).join("_"), "spray_present");
        	   a.end();
        });
});
