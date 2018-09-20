/*global module*/
var NIL;
function contained(array, element) {
    return array.indexOf(element) >= 0;
}
contained.into = function containedInto(array) {
    return contained.bind(NIL, array);
}
function missing(array, element) {
    return array.indexOf(element) < 0;
}
missing.from = function missingFrom(array) {
    return missing.bind(NIL, array);
}

function intersection(A, B) {
    return A.filter(contained.into(B));
}
function union(A, B) {
    return A.concat(B.filter(missing.from(A)));
}
if (module) {
    module.exports = {
	       intersection: intersection,
	       union: union
	   };
}