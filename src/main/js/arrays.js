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
function getter(prop, obj) {
    return obj[prop];
}
getter.of = function get(prop) {
    return getter.bind(NIL, prop);
}
function Isolated(prop, value, i) {
    this[prop] = value;
    this['i'] = i;
}
function isolator(prop, getValue, obj, i) {
    return new Isolated(prop, getValue(obj), i);
}
isolator.of = function isolatorOf(prop, getValue) {
    if (!getValue) {
        getValue = getter.of(prop);
    }
    return isolator.bind(NIL, prop, getValue);
};
function massIsolator(data, prop, getValue) {
    return data.map(isolator.of(prop, getValue));
}
massIsolator.from = function massIsolatorFrom(array) {
    return massIsolator.bind(NIL, array);
};

if (module) {
    module.exports = {
	       intersection: intersection,
	       union: union,
	       isolator: massIsolator
	   };
}