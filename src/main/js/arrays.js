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
function binarySearch(isMore, data, key, value, start, end) {
  var cnt = data.length, mid;
  if (start === NIL) {
    start = 0;
    end = cnt-1;
  }
  if (end - start < 2) {
  	  return isMore(data[start][key], value)?
  	      start: 
  	      isMore(data[end][key], value)?
  	          end:
  	          cnt;
  }
  mid = Math.floor((start + end) / 2);
  if (isMore(data[mid][key], value)) {
    return Math.min(binarySearch(isMore, data, key, value, start, mid-1), mid);
  }
  return binarySearch(isMore, data, key, value, mid+1, end);
}
function isStrictlyMore(value, threshold) {
    return value > threshold;
}
function isMoreOrEqual(value, threshold) {
    return value >= threshold;
}
binarySearch.strict = binarySearch.bind(NIL, isStrictlyMore);
binarySearch.including = binarySearch.bind(NIL, isMoreOrEqual);

if (module) {
    module.exports = {
	       intersection: intersection,
	       union: union,
	       getter: getter,
	       isolator: isolator,
	       massIsolator: massIsolator,
	       binarySearch: binarySearch
	   };
}