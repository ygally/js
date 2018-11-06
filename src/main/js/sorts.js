/*global module*/
var NIL;
function comparator(prop, obj1, obj2) {
    var v1 = obj1[prop], v2 = obj2[prop];
    return v1<v2? -1:
        v1>v2? 1: 0;
}
function comparatorViaGetter(getter, obj1, obj2) {
    var v1 = getter(obj1), v2 = getter(obj2);
    return v1<v2? -1:
        v1>v2? 1: 0;
}
function negativeComparator(prop, obj1, obj2) {
    var v1 = obj1[prop], v2 = obj2[prop];
    return v1>v2? -1:
        v1<v2? 1: 0;
}
function negativeComparatorViaGetter(getter, obj1, obj2) {
    var v1 = getter(obj1), v2 = getter(obj2);
    return v1>v2? -1:
        v1<v2? 1: 0;
}
comparator.by = function comparatorBy(prop, way) {
    if (typeof prop == 'function') {
        return way === 'desc'?
            negativeComparatorViaGetter.bind(NIL, prop):
            comparatorViaGetter.bind(NIL, prop);
    }
    return way === 'desc'?
            negativeComparator.bind(NIL, prop):
            comparator.bind(NIL, prop);
};
if (module) {
    module.exports = {
	       comparator: comparator
	   };
}