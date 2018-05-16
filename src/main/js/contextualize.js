var LEN = 'length',
    RE_FMT = "[{][{]K[}][}]",
    DEFAULT_RE = new RegExp(RE_FMT.replace("K", "([^}]+)")),
    UNDEFINED,
    isArray = Array.isArray;
function identity(d) { return d; }
function toString(d) { return '' + d; }
function toNumber(d) { return +d; }
var types = {
    "text": toString,
    "int": toNumber
}
function collector(obj) {
    return function(kvPair) {
        obj[kvPair[0]] = kvPair[1];
    };
}
function get(D, req, type, fmt) {
    var R;
    if (req) {
        if (isArray(req)) {
            if (req[LEN]) {
                R = get(D, req[0], type, fmt);
                return R !== UNDEFINED?
                    R:
                    get(D, req.slice(1), type, fmt);
            }
            return UNDEFINED;
        }
	       R = D[req];
	       if (R === UNDEFINED) {
	           return R;
	       	}
	       type = type && types[type] || identity;
        R = type(R);
        return (fmt||identity)(R);
    }
}
function expFrom(D, T, RE) {
    if (RE.test(T)) {
        var R = RegExp.$1, 
            pattern = RE_FMT.replace("K", R);
        pattern = new RegExp(pattern, "g");
        T = T.replace(pattern, get(D, R));
        return expFrom(D, T, RE);
    }
    return T;
}

function contextualize(D, RE) {
    function innerTranslate(def) {
        if (isArray(def)) {
            var accu = {};
            def.map(innerTranslate)
               .forEach(collector(accu));
            return accu;
        } 
        return [def.name, def.text?
            expFrom(D, def.text, RE || DEFAULT_RE):
            get(D, def.require || def.req, def.type, def.fmt)
        ];
    }
    return {
        translate: function translate(def) {
        	   return innerTranslate(isArray(def)? def: [def]);
        }
    };
}

if (module) {
    module.exports = contextualize;
}