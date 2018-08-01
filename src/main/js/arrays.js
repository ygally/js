var yareq = require('../../main/js/require');
yareq('provide:arrays', function arrays(core) {
	   function intersection(A, B) {
        return A.filter(e => B.indexOf(e) >= 0);
	   }
	   return {
	       intersection: intersection
	   };
});