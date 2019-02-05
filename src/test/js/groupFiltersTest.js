/*global module*/
var cage = module.require('../../main/js/yacage');
cage(['test', 'groupFilters'], function usingFilters(test, groupFilterLib) {
    function numerically(a, b) {
        return Math.sign(a-b);
    }

    test('based on value filters', function(a) {
        var filters = groupFilterLib.build();
        filters.create('category');
        filters.create('age', 'years');
        filters.create('cute', o => o.isCute && o.isCute() || !1);
        filters.create('cap', o => o.name.charAt(0).toUpperCase());
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

    test('based on value filters (bis)', function(a) {
        var filters = groupFilterLib.build();
        filters.create('type');
        filters.create('faces');
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
        a.equals(filters.objectsFor('type:2D').map(o=>o.name).sort().join("_"), "square_triangle");
    	   a.end();
    });

    test('init filters multiple times', function(a) {
        var filters = groupFilterLib.build();
        filters.create('color');
        var coins = [
            {name: 'c10', color: 'red'},
            {name: 'c20', color: 'red'},
            {name: 'c50', color: 'red'}
        ];
        filters.initWith(coins);
        a.equals(filters.names().sort().join(";"), 'color:red');
        coins.push(
            {name: 'e1', color: 'grey'},
            {name: 'e2', color: 'grey'});
        filters.initWith(coins);
        a.equals(filters.names().sort().join(";"), 'color:grey;color:red');
    	   a.end();
    });
});
