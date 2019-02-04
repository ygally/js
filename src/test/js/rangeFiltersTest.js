/*global module*/
var cage = module.require('../../main/js/yacage');
cage(['test', 'rangeFilters'], function usingFilters(test, rangeFilterLib) {
    test('range filters', function(a) {
        var rangeFilters = rangeFilterLib.build();
        rangeFilters.create('number', o => +o.name.charAt(1));
        var coins = [
            {name: 'c20', color: 'red'},
            {name: 'c10', color: 'red'},
            {name: 'c50', color: 'red'}
        ];
        rangeFilters.initWith(coins);
        a.equals(rangeFilters.names().join(";"), 'number');
        a.equals(rangeFilters.indexesFor('number').join(','), '1,0,2');
        a.equals(rangeFilters.indexesFor('number').before(5).join(','), '1,0');
        a.equals(rangeFilters.indexesFor('number').max(5).join(','), '1,0,2');
        a.equals(rangeFilters.indexesFor('number').after(2).join(','), '2');
        a.equals(rangeFilters.indexesFor('number').min(2).join(','), '0,2');
        a.equals(rangeFilters.indexesFor('number').between(2, 4).join(','), '0');
        a.equals(rangeFilters.indexesFor('number').between(1).and(3).join(','), '1,0');
        a.equals(rangeFilters.objectsFor('number').map(o=>o.name).join(','), 'c10,c20,c50');
        a.equals(rangeFilters.objectsFor('number').before(5).map(o=>o.name).join(), 'c10,c20');
        a.equals(rangeFilters.objectsFor('number').max(5).map(o=>o.name).join(), 'c10,c20,c50');
        a.equals(rangeFilters.objectsFor('number').after(2).map(o=>o.name).join(), 'c50');
        a.equals(rangeFilters.objectsFor('number').min(2).map(o=>o.name).join(), 'c20,c50');
        a.equals(rangeFilters.objectsFor('number').between(2, 4).map(o=>o.name).join(), 'c20');
        a.equals(rangeFilters.objectsFor('number').between(1).and(3).map(o=>o.name).join(), 'c10,c20');
    	   a.end();
    });
});
