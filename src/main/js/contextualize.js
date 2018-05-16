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
    if (RE.test(T)) {
        var R = RegExp.$1,
            pattern = RE_FMT.replace("K", R);
        pattern = new RegExp(pattern, "g");
        T = T.replace(pattern, get(D, R));
        return expFrom(D, T, RE);
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
            get(D, def.require || def.req)];
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
