/*global module*/
var test = module.require('./test');
var arrays = module.require('../../main/js/arrays');

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
test('isolation', function(a) {
    var data = COLORS.slice(),
        isolateName = arrays.isolator.of('name'),
        isolateColor = arrays.isolator.of('color'),
        isolateMissing = arrays.isolator.of('missing'),
        isolateShort = arrays.isolator.of('short', o=>o.getShort());
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
        isolate = arrays.massIsolator.from(data);
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