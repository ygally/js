/*global module*/
var test = module.require('./test'),
    sorts = module.require('../../main/js/sorts'),
    arrays = module.require('../../main/js/arrays'),
    comparator = sorts.comparator,
    replaceIn = arrays.replaceIn,
    getter = arrays.getter,
    isolator = arrays.isolator,
    binarySearch = arrays.binarySearch,
    massIsolator = arrays.massIsolator,
    NIL;

test('testWarmer', a => {
    a.equals("Hello", 'Hello');
    a.equals("World", 'World');
});
test('numeric intersections', function(a) {
    var inter = arrays.intersection;
    a.equals(inter([42, 43],[42]).join("_"), "42");
    a.equals(inter([1,2,3,4,5],[2,4]).join("_"), "2_4");
    a.equals(inter([1,4,8,14],[1,5,6,8]).join(","), "1,8");
    a.equals(inter([42, 43],[]).join(), "");
    a.equals(inter([],[]).join(), "");
    a.equals(inter([], [5]).join(), "");
    a.end();
});
test('numeric union', function(a) {
    var union = arrays.union;
    a.equals(union([42, 43],[42]).join("_"), "42_43");
    a.equals(union([1,3,4,5],[2,4]).join("_"), "1_3_4_5_2");
    a.equals(union([1,14],[5,6,8]).join(","), "1,14,5,6,8");
    a.equals(union([4, 3],[]).join(','), "4,3");
    a.equals(union([],[]).join(), "");
    a.equals(union([], [5]).join(), "5");
    a.end();
});
test('replace into array', function(a) {
    var initial = [2,4,12];
    replaceIn(initial,[36,8,5,9]);
    a.equals(initial.join("_"), "36_8_5_9");
    a.equals(replaceIn([42, 43],[42]).join("_"), "42");
    a.equals(replaceIn([1,3,4,5],[2,4]).join("_"), "2_4");
    a.equals(replaceIn([1,14],[5,6,8]).join(","), "5,6,8");
    a.equals(replaceIn([4, 3],[]).join(','), "");
    a.equals(replaceIn([],[]).join(), "");
    a.equals(replaceIn([], [5]).join(), "5");
    a.end();
});
function Color(name, code) {
    this.name = name;
    this.color = code;
}
Color.prototype.getShort = function short() {
    return this.name.charAt().toUpperCase();
}
var COLORS = [
        new Color('red', '#f00'),
        new Color('green', '#0f0'),
        new Color('blue', '#00f')
    ];
test('getting props', a => {
    var getColorName = getter.of('name');
    a.equals(getColorName(COLORS[0]), 'red');
    a.equals(getColorName(COLORS[1]), 'green');
});
test('isolation', function(a) {
    var data = COLORS.slice(),
        isolateName = isolator.of('name'),
        isolateColor = isolator.of('color'),
        isolateMissing = isolator.of('missing'),
        isolateShort = isolator.of('short', o=>o.getShort());
    var names = data.map(isolateName);
    a.equals(names.map(o=>o.name).join("_"), "red_green_blue");
    a.equals(names.map(o=>o.i).join(""), "012");
    a.equals(names.map(o=>o.color).join(""), "");
    var colors = data.map(isolateColor);
    a.equals(colors.map(o=>o.name).join(""), "");
    a.equals(colors.map(o=>o.i).join(""), "012");
    a.equals(colors.map(o=>o.color).join("_"), "#f00_#0f0_#00f");
    var missing = data.map(isolateMissing);
    a.equals(missing.map(o=>o.missing).join(""), "");
    var shorts = data.map(isolateShort);
    a.equals(shorts.map(o=>o.name).join(""), "");
    a.equals(shorts.map(o=>o.i).join(""), "012");
    a.equals(shorts.map(o=>o.color).join(""), "");
    a.equals(shorts.map(o=>o.short).join(""), "RGB");
    a.end();
});
test('array isolation', function(a) {
    var data = COLORS.slice(),
        isolate = massIsolator.from(data);
    var names = isolate('name');
    a.equals(names.map(o=>o.name).join("_"), "red_green_blue");
    a.equals(names.map(o=>o.i).join(""), "012");
    a.equals(names.map(o=>o.color).join(""), "");
    var colors = isolate('color');
    a.equals(colors.map(o=>o.name).join(""), "");
    a.equals(colors.map(o=>o.i).join(""), "012");
    a.equals(colors.map(o=>o.color).join("_"), "#f00_#0f0_#00f");
    var missing = isolate('missing');
    a.equals(missing.map(o=>o.missing).join(""), "");
    var shorts = isolate('short', o=>o.getShort());
    a.equals(shorts.map(o=>o.name).join(""), "");
    a.equals(shorts.map(o=>o.i).join(""), "012");
    a.equals(shorts.map(o=>o.color).join(""), "");
    a.equals(shorts.map(o=>o.short).join(""), "RGB");
    a.end();
});
test('array binary search', function(a) {
    var data = [{px:-3},{px:0},{px:2},{px:6},{px:7},{px:9}],
        strictlySup = binarySearch.strictlyMore.bind(NIL, data, 'px'),
        sup = binarySearch.moreOrEqual. bind(NIL, data, 'px');
    a.equals(strictlySup(-4), 0);
    a.equals(sup(-4), 0);
    a.equals(strictlySup(-3), 1);
    a.equals(sup(-3), 0);
    a.equals(strictlySup(0), 2);
    a.equals(sup(0), 1);
    a.equals(strictlySup(6), 4);
    a.equals(sup(6), 3);
    // bear in mind that returned index
    // can be after last element! 
    a.equals(strictlySup(9), 6);
    a.equals(sup(9), 5);
});
test('array desc binary search', function(a) {
	   function Pt(name, x, y) {
	       this.name = name;
	       this.x = x;
	       this.y = y;
	   }
    var data = [
            new Pt('A', 8, 4),
            new Pt('B', 5, 2),
            new Pt('C', 2, 6),
            new Pt('D', 1, 7)
        ],
        strictlyLess = binarySearch.strictlyLess.bind(NIL, data, 'x'),
        isolatedY = data.map(isolator.of('y')).sort(comparator.by('y', 'desc')),
        maximum = binarySearch.lessOrEqual.bind(NIL, isolatedY, 'y');
    a.equals(strictlyLess(2), 3);
    a.equals(strictlyLess(3), 2);
    a.equals(strictlyLess(5), 2);
    a.equals(strictlyLess(6), 1);
    a.equals(maximum(2), 3);
    a.equals(data[isolatedY[maximum(2)].i].name, 'B');
    a.equals(data[isolatedY[maximum(3)].i].name, 'B');
    a.equals(data[isolatedY[maximum(5)].i].name, 'A');
    a.equals(data[isolatedY[maximum(6)].i].name, 'C');
});
