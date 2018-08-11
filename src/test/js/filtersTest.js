/*global require */
var yareq = require('../../main/js/require');
var yatest = require('./test');

require('../../main/js/filters');
function numerically(a, b) {
    return Math.sign(a-b);
}

yatest('simple filters', function(a) {
    yareq(
        ['filters'],
        function simpleFilters(core, filters) {
            filters.reset();
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

yatest('based on value filters', function(a) {
    yareq(['filters'], function valueFilters(core, filters) {
        filters.reset();
        filters.byProperty('category');
        filters.byProperty('age', 'years');
        filters.byProperty('cute', o => o.isCute && o.isCute() || !1);
        filters.byProperty('cap', o => o.name.charAt(0).toUpperCase());
        var cats = [
            {name: 'Cuttie', category: 'Mau égyptien', years: 12, isCute: () => true},
            {name: 'Akira', category: 'Himalayen', years: 2},
            {name: 'Chewbacca', category: 'Siamois', years: 4},
            {name: 'Alex', category: 'Mau égyptien', years: 4, isCute: () => true},
            {name: 'Mioumiou', category: 'Himalayen', years: 4, isCute: () => true}
        ];
        filters.initWith(cats);
        var expectedNames = 'age:12;age:2;age:4';
        expectedNames += ';cap:A;cap:C;cap:M';
        expectedNames += ';category:Himalayen;category:Mau égyptien;category:Siamois';
        expectedNames += ';cute:false;cute:true';
        a.equals(filters.names().sort().join(";"), expectedNames);
        a.equals(filters.valuesOf('category').sort().join(";"), "Himalayen;Mau égyptien;Siamois");
        a.equals(filters.valuesOf('age').sort(numerically).join(";"), '2;4;12');
        a.equals(filters.indexesFor('category:Siamois').join("_"), "2");
        a.equals(filters.objectsFor('category:Mau égyptien').map(o=>o.name).join("_"), "Cuttie_Alex");
    	   a.end();
    });
});
