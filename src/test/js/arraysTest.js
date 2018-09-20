var arrays = require('../../main/js/arrays');
var yatest = require('./test');

yatest('numeric intersections', function(a) {
    var inter = arrays.intersection;
    a.equals(inter([42, 43],[42]).join("_"), "42");
    a.equals(inter([1,2,3,4,5],[2,4]).join("_"), "2_4");
    a.equals(inter([1,4,8,14],[1,5,6,8]).join(","), "1,8");
	   a.equals(inter([42, 43],[]).join(), "");
    a.equals(inter([],[]).join(), "");
    a.equals(inter([], [5]).join(), "");
    a.end();
});

yatest('numeric union', function(a) {
    var union = arrays.union;
    a.equals(union([42, 43],[42]).join("_"), "42_43");
    a.equals(union([1,3,4,5],[2,4]).join("_"), "1_3_4_5_2");
    a.equals(union([1,14],[5,6,8]).join(","), "1,14,5,6,8");
	   a.equals(union([4, 3],[]).join(','), "4,3");
    a.equals(union([],[]).join(), "");
    a.equals(union([], [5]).join(), "5");
    a.end();
});