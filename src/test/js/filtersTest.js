/*global require */
var cage = require('../../main/js/yacage');
var yatest = require('./test');

require('../../main/js/filters');

function numerically(a, b) {
    return Math.sign(a-b);
}

yatest('simple filters', function(a) {
    cage(['filters'], function simpleFilters(core, filters) {
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
    cage(['filters'], function valueFilters(core, filterLib) {
        filters = filterLib.newInstance();
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
        a.equals(filters.objectsFor('category:Mau égyptien').map(o=>o.name).sort().join("_"), "Alex_Cuttie");
    	   a.end();
    });
});

yatest('standalone filters', function(a) {
    cage(['filters'], function standaloneFilters(core, filterLib) {
        filters = filterLib.newInstance();
        filters.byProperty('type');
        filters.byProperty('faces');
        var shapes = [
            {name: 'square', type: '2D', faces: 1},
            {name: 'triangle', type: '2D', faces: 1},
            {name: 'pyramide', type: '3D', faces: 5},
            {name: 'prism', type: '3D', faces: 5},
            {name: 'cube', type: '3D', faces: 6}
        ];
        filters.initWith(shapes);
        var expectedNames = 'faces:1;faces:5;faces:6';
        expectedNames += ';type:2D;type:3D';
        a.equals(filters.names().sort().join(";"), expectedNames);
        a.equals(filterLib.managers().sort().join(";").substring(0,15), "main;manager-1-");
        a.equals(filters.objectsFor('type:2D').map(o=>o.name).sort().join("_"), "square_triangle");
    	   a.end();
    });
});

yatest('init filters multiple times', function(a) {
    cage(['filters'], function standaloneFilters(core, filterLib) {
        filters = filterLib.newInstance();
        filters.create('E', o => o.name.charAt(0) == 'e');
        filters.byProperty('color');
        var coins = [
            {name: 'c10', color: 'red'},
            {name: 'c20', color: 'red'},
            {name: 'c50', color: 'red'}
        ];
        filters.initWith(coins);
        a.equals(filters.names().sort().join(";"), 'E;color:red');
        coins.push(
            {name: 'e1', color: 'grey'},
            {name: 'e2', color: 'grey'});
        filters.initWith(coins);
        a.equals(filters.names().sort().join(";"), 'E;color:grey;color:red');
    	   a.end();
    });
});

yatest('range filters', function(a) {
    cage(['filters'], function standaloneFilters(core, filterLib) {
        filters = filterLib.newInstance();
        filters.createRange('number', o => +o.name.charAt(1));
        var coins = [
            {name: 'c20', color: 'red'},
            {name: 'c10', color: 'red'},
            {name: 'c50', color: 'red'}
        ];
        filters.initWith(coins);
        a.equals(filters.names().join(";"), 'number');
        a.equals(filters.indexesFor('number').join(','), '1,0,2');
        a.equals(filters.indexesFor('number').before(5).join(','), '1,0');
        a.equals(filters.indexesFor('number').max(5).join(','), '1,0,2');
        a.equals(filters.indexesFor('number').after(2).join(','), '2');
        a.equals(filters.indexesFor('number').min(2).join(','), '0,2');
        a.equals(filters.indexesFor('number').between(2, 4).join(','), '0');
        a.equals(filters.indexesFor('number').between(5).and(6).join(','), '2');
    	   a.end();
    });
});