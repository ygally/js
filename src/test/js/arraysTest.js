var yareq = require('../../main/js/require');
var yatest = require('./test');

require('../../main/js/arrays');

yatest('numeric intersections', function(a) {
    yareq(
        ['arrays'],
        function numInter(core, arrays) {
            var inter = arrays.intersection;
        	   a.equals(inter([42, 43],[42]).join("_"), "42");
        	   a.equals(inter([1,2,3,4,5],[2,4]).join("_"), "2_4");
        	   a.equals(inter([1,4,8,14],[1,5,6,8]).join(","), "1,8");
        	   a.equals(inter([42, 43],[]).join(), "");
        	   a.equals(inter([],[]).join(), "");
        	   a.equals(inter([], [5]).join(), "");
        	   a.end();
        });
});
