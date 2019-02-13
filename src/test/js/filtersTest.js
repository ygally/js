/*global module*/
var cage = module.require('../../main/js/yacage');
module.require('../../main/js/yacage-nodeHelper');
cage(['test', 'filters'], function usingFilters(test, filterLib) {
    function numerically(a, b) {
        return Math.sign(a-b);
    }
    test('testWarmer', a => {
        a.equals("Hello", 'Hello');
        a.equals("World", 'World');
    });
    function has(letter) {
        return o => o.name.indexOf(letter) >= 0;
    }
    var OBJECTS = [
            {name: 'spray'},
            {name: 'elite'},
            {name: 'present'}
        ];
    test('simple filters', function(a) {
        var filters = filterLib;
        filters.create('matchA', has('a'));
        filters.create('matchE', has('e'));
        filters.create('matchR', has('r'));
        filters.initWith(OBJECTS);
        a.equals(filters.indexesFor('matchA').join("_"), "0");
        a.equals(filters.indexesFor('matchE').join("_"), "1_2");
        a.equals(filters.objectsFor('matchR').map(o=>o.name).join("_"), "spray_present");
        a.end();
    });
    test('mult. simple filters', function(a) {
        var filters = filterLib.build();
        filters.create('a,e,r,p,s,t,i'
            .split(',').map(l => ({
                name: 'match' + l.toUpperCase(),
                accept: has(l)
            })));
        filters.initWith(OBJECTS);
        a.equals(filters.indexesFor('matchA').join("_"), "0");
        a.equals(filters.indexesFor('matchE').join("_"), "1_2");
        a.equals(filters.indexesFor('matchR').join("_"), "0_2");
        a.equals(filters.indexesFor('matchP').join("_"), "0_2");
        a.equals(filters.indexesFor('matchS').join("_"), "0_2");
        a.equals(filters.indexesFor('matchT').join("_"), "1_2");
        a.equals(filters.objectsFor('matchI').map(o=>o.name).join("_"), "elite");
        a.end();
    });
    function Cat(name, category, years, isCute) {
        this.name = name;
        this.category = category;
        this.years = years;
        this.isCute = isCute;
    }
    function $c(n,c,y,i) {
        return new Cat(n,c,y,i);
    }
    var CATS = [
            $c('Cuttie', 'Mau égyptien', 12, () => true),
            $c('Akira', 'Himalayen', 2),
            $c('Chewbacca', 'Siamois', 4),
            $c('Alex', 'Mau égyptien', 1, () => true),
            $c('Mioumiou', 'Himalayen', 4, () => true)
        ];
    test('prop filters', function(a) {
        var filters = filterLib.build();
        filters.byProperty('category');
        filters.byProperty('age', 'years');
        filters.byProperty('cute', o => o.isCute && o.isCute() || !1);
        filters.byProperty('cap', o => o.name.charAt(0).toUpperCase());
        filters.initWith(CATS);
        var expectedNames = 'age:1;age:12;age:2;age:4';
        expectedNames += ';cap:A;cap:C;cap:M';
        expectedNames += ';category:Himalayen;category:Mau égyptien;category:Siamois';
        expectedNames += ';cute:false;cute:true';
        a.equals(filters.names().sort().join(";"), expectedNames);
        a.equals(filters.valuesOf('category').sort().join(";"), "Himalayen;Mau égyptien;Siamois");
        a.equals(filters.valuesOf('age').sort(numerically).join(";"), '1;2;4;12');
        a.equals(filters.indexesFor('category:Siamois').join("_"), "2");
        a.equals(filters.objectsFor('category:Mau égyptien').map(o=>o.name).sort().join("_"), "Alex_Cuttie");
    	   a.end();
    });
    var cat_discreet_props = [
        {name: 'category'},
        {name: 'age', property: c => c.years + ' an' + (c.years>1? 's':'')}
    ];
    test('multiple prop filters', function(a) {
        var filters = filterLib.build();
        filters.byProperty(cat_discreet_props);
        filters.initWith(CATS);
        var expectedNames = 'age:1 an;age:12 ans;age:2 ans;age:4 ans';
        expectedNames += ';category:Himalayen;category:Mau égyptien;category:Siamois';
        a.equals(filters.names().sort().join(";"), expectedNames);
        a.equals(filters.valuesOf('category').sort().join(";"), "Himalayen;Mau égyptien;Siamois");
        a.equals(filters.valuesOf('age').sort().join(";"), '1 an;12 ans;2 ans;4 ans');
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
    test('many inits of filters', function(a) {
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
    var COINS = [
        {name: 'c20', color: 'red', size: .8},
        {name: 'c10', color: 'red', size: .7},
        {name: 'c50', color: 'red', size: 1.07},
        {name: 'e1', color: 'grey', size: 1},
        {name: 'e2', color: 'grey', size: 1.1}
    ];
    function initial(coin) {
        return coin.name.charAt(0);
    }
    function euroValue(o) {
        return initial(o) == 'c'?
            +o.name.charAt(1)/10:
            +o.name.charAt(1)
    }
    test('range filters', function(a) {
        var filters = filterLib.build();
        filters.createRange('number', euroValue);
        filters.initWith(COINS);
        a.equals(filters.names().join(";"), 'number');
        a.equals(filters.indexesFor('number').join(','), '1,0,2,3,4');
        a.equals(filters.indexesFor('number').before(.5).join(','), '1,0');
        a.equals(filters.indexesFor('number').max(.5).join(','), '1,0,2');
        a.equals(filters.indexesFor('number').after(.2).join(','), '2,3,4');
        a.equals(filters.indexesFor('number').min(.2).join(','), '0,2,3,4');
        a.equals(filters.indexesFor('number').between(.2, .4).join(','), '0');
        a.equals(filters.indexesFor('number').between(.1).and(.3).join(','), '1,0');
    	   a.end();
    });
    test('multiple creation', function(a) {
        var filters = filterLib.build();
        filters.createRange([
            {name:'number', property:euroValue},
            {name:'size'}
        ]);
        filters.initWith(COINS);
        a.equals(filters.names().sort().join(";"), 'number;size');
        a.equals(filters.indexesFor('size').join(','), '1,0,3,2,4');
        a.equals(filters.indexesFor('number').before(.4).join(','), '1,0');
        a.equals(filters.indexesFor('number').max(.5).join(','), '1,0,2');
        a.equals(filters.indexesFor('size').after(1).join(','), '2,4');
        a.equals(filters.indexesFor('size').min(.8).join(','), '0,3,2,4');
        a.equals(filters.indexesFor('number').between(.2, .4).join(','), '0');
        a.equals(filters.indexesFor('number').between(.1).and(.3).join(','), '1,0');
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
    var PRODUCTS = [
            $p('milk','liquid', 0.02, 1.2, 0.92),
            $p('Frosties','solid', 0.6, 0.8, 4.6),
            $p('Nutella','cream', 0.7, 0.75, 5.7),
            $p('flour','powder', 0.03, 1.2, 1.45),
            $p('juice','liquid', 0.14, 1, 1.2),
            $p('soup','liquid', 0.08, 1.2, 2.65),
            $p('bread','solid', 0.09, 0.75, 1.1),
            $p('iced tea','liquid', 0.125, 1.5, 1.32)
        ];
    test('union of filters', function(a) {
        var filters = filterLib.build();
        p_discreet_props.forEach(p=>filters.byProperty(p));
        p_range_props.forEach(p=>filters.createRange(p));
        filters.byProperty('letter', o=>o.name.charAt(0).toUpperCase());
        filters.initWith(PRODUCTS);
        a.equals(filters.names('letter')
            .map(n=>n.substr(7)).join(";"),
            'M;F;N;J;S;B;I');
        a.equals(filters.indexesFor(SOLID_OR_CREAM)
            .map(i=>PRODUCTS[i].name).sort().join(','),
            'Frosties,Nutella,bread');
        a.equals(filters.indexesFor('letter:F', 'letter:J')
            .toOriginals()
            .map(p=>p.name).sort().join(','),
            'Frosties,flour,juice');
    	   a.end();
    });
    test('intersect° of filters', function(a) {
        var filters = filterLib.build();
        p_discreet_props.forEach(p=>filters.byProperty(p));
        p_range_props.forEach(p=>filters.createRange(p));
        filters.byProperty('letter', o=>o.name.charAt(0).toUpperCase());
        filters.initWith(PRODUCTS);
        a.equals(filters.indexesFor(['letter:M', 'letter:I'])
            .and('type:liquid')
            .toOriginals()
            .map(p=>p.name).sort().join(','),
            'iced tea,milk');
        a.equals(filters.indexesFor('letter:F')
            .and(['type:powder'])
            .toOriginals()
            .map(p=>p.name).sort().join(','),
            'flour');
        a.equals(filters.indexesFor(['letter:J'])
            .and(['type:liquid', 'type:solid'])
            .toOriginals()
            .map(p=>p.name).sort().join(','),
            'juice');
    	   a.end();
    });
});
