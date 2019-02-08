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
function replaceIn(arr, nxt) {
	   arr.splice.apply(arr, [0, arr.length].concat(nxt));
	   return arr;
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
function simpleIsolator(prop, obj, i) {
    return new Isolated(prop, obj[prop], i);
}
isolator.of = function isolatorOf(prop, getValue) {
    return getValue?
        isolator.bind(NIL, prop, getValue):
        simpleIsolator.bind(NIL, prop);
};
function massIsolator(data, prop, getValue) {
    return data.map(isolator.of(prop, getValue));
}
massIsolator.from = function massIsolatorFrom(array) {
    return massIsolator.bind(NIL, array);
};
function binarySearch(validate, data, key, value, start, end) {
  var cnt = data.length, mid;
  if (start === NIL) {
    start = 0;
    end = cnt-1;
  }
  if (end - start < 2) {
  	  return validate(data[start][key], value)?
  	      start: 
  	      validate(data[end][key], value)?
  	          end:
  	          cnt;
  }
  mid = Math.floor((start + end) / 2);
  if (validate(data[mid][key], value)) {
    return Math.min(binarySearch(validate, data, key, value, start, mid-1), mid);
  }
  return binarySearch(validate, data, key, value, mid+1, end);
}
binarySearch.comparingWith = function comparingWith(validate) {
    customBinarySearch = binarySearch.bind(NIL, validate);
    customBinarySearch.into = function searchingInto(array) {
        return customBinarySearch.bind(NIL, array);
    };
    return customBinarySearch;
};
function isStrictlyMore(value, threshold) {
    return value > threshold;
}
function isMoreOrEqual(value, threshold) {
    return value >= threshold;
}
function isStrictlyLess(value, threshold) {
    return value < threshold;
}
function isLessOrEqual(value, threshold) {
    return value <= threshold;
}
binarySearch.strictlyMore = binarySearch.comparingWith(isStrictlyMore);
binarySearch.moreOrEqual = binarySearch.comparingWith(isMoreOrEqual);
binarySearch.strictlyLess = binarySearch.comparingWith(isStrictlyLess);
binarySearch.lessOrEqual = binarySearch.comparingWith(isLessOrEqual);
if (module) {
    module.exports = {
	       intersection: intersection,
	       union: union,
	       replaceIn: replaceIn,
	       getter: getter,
	       isolator: isolator,
	       massIsolator: massIsolator,
	       binarySearch: binarySearch
	   };
}
