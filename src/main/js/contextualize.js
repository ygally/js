var LEN = 'length',
    RE_FMT = "[{][{]K[}][}]",
    DEFAULT_RE = new RegExp(RE_FMT.replace("K", "([^}]+)")),
    UNDEFINED,
    isArray = Array.isArray;
function collector(obj) {
    return function(kvPair) {
        obj[kvPair[0]] = kvPair[1];
    };
}
function get(D, req) {
    if (req) {
        if (isArray(req)) {
            if (req[LEN]) {
                var R = get(D, req[0]);
                return R !== UNDEFINED?
                    R:
                    get(D, req.slice(1));
            }
            return UNDEFINED;
        } 
        return D[req];
    }
}
function expFrom(D, T, RE) {
    //console.log('expanding '+T+' [pat: ' +RE+']');
    if (RE.test(T)) {
        var R = RegExp.$1;
        return expFrom(D,
            T.replace(
                 new RegExp(RE_FMT.replace("K", R), "g"),
                 get(D, R)),
            RE);
    }
    return T;
}
function contextualize(D, RE) {
    function innerTranslate(def) {
        if (isArray(def)) {
            var accu = {};
            def.map(innerTranslate)
                .forEach(collector(accu));
            return accu;
        } 
        return [def.name, def.text ?
                expFrom(D, def.text, RE || DEFAULT_RE):
                get(D, def.req)];
    }
    return {
        translate: function translate(def) {
        	   return innerTranslate(isArray(def)? def: [def]);
        }
    };
}

if (module) {
    module.exports = contextualize;
}
