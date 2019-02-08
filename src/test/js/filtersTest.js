/*global module*/
var cage = module.require('../../main/js/yacage');
module.require('../../main/js/yacage-nodeHelper');
cage(['test', 'filters'], function usingFilters(test, filterLib) {
    function numerically(a, b) {
        return Math.sign(a-b);
    }

    test('simple filters', function(a) {
        var filters = filterLib;
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

    test('based on value filters', function(a) {
        var filters = filterLib.build();
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

    test('standalone filters', function(a) {
        var filters = filterLib.build('forTest');
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
        a.equals(filterLib.managers().sort().join(";").indexOf("forTest")>=0, true);
        a.equals(filters.objectsFor('type:2D').map(o=>o.name).sort().join("_"), "square_triangle");
    	   a.end();
    });

    test('init filters multiple times', function(a) {
        var filters = filterLib.build();
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

    test('range filters', function(a) {
        var filters = filterLib.build();
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
        a.equals(filters.indexesFor('number').between(1).and(3).join(','), '1,0');
    	   a.end();
    });

    function Product(name, type, sugar, weight, price) {
        this.name = name;
        this.type = type;
        this.sugar = sugar;
        this.weight= weight;
        this.price = price;
    }
    
    function $p(n,t,s,v,p) {
        return new Product(n,t,s,v,p);
    }
    var p_discreet_props = ['name', 'type'];
    var p_range_props = ['sugar', 'weight', 'price'];
    var SOLID_OR_CREAM = ['type:solid', 'type:cream'];
    
    test('union of filters', function(a) {
        var filters = filterLib.build();
        p_discreet_props.forEach(p=>filters.byProperty(p));
        p_range_props.forEach(p=>filters.createRange(p));
        filters.byProperty('letter', o=>o.name.charAt(0).toUpperCase());
        var products = [
            $p('milk','liquid', 0.02, 1.2, 0.92),
            $p('Frosties','solid', 0.6, 0.8, 4.6),
            $p('Nutella','cream', 0.7, 0.75, 5.7),
            $p('flour','powder', 0.03, 1.2, 1.45),
            $p('juice','liquid', 0.14, 1, 1.2),
            $p('soup','liquid', 0.08, 1.2, 2.65),
            $p('bread','solid', 0.09, 0.75, 1.1)
        ];
        filters.initWith(products);
        a.equals(filters.names('letter').map(n=>n.substr(7)).join(";"), 'M;F;N;J;S;B');
        a.equals(filters.unionOf(SOLID_OR_CREAM)
            .map(i=>products[i].name).sort().join(','),
            'Frosties,Nutella,bread');
    	   a.end();
    });
});
