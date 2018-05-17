var RE_FMT = "[{][{]K[}][}]",
    DEFAULT_RE = new RegExp(RE_FMT.replace("K", "([^}]+)")),
    UNDEFINED,
    isArray = Array.isArray;
function identity(d) { return d; }
function toString(d) { return '' + d; }
function toNumber(d) { return +d; }
function asArray(d) {
	   return isArray(d)? d: [d];
}
var types = {
    "text": toString,
    "int": toNumber
}
function get(D, req, type, fmt) {
    var R;
    if (req) {
        if (isArray(req)) {
            if (req.length) {
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
function collectInto(obj) {
    return function(kvPair) {
        obj[kvPair[0]] = kvPair[1];
    };
}
function contextualize(D, RE) {
    function innerTranslate(definition) {
        if (isArray(definition)) {
            var accu = {};
            definition.map(innerTranslate)
                .forEach(collectInto(accu));
            return accu;
        } 
        return [definition.name, definition.text?
            expFrom(D, definition.text, RE || DEFAULT_RE):
            get(D, definition.require || definition.req, definition.type, definition.fmt)
        ];
    }
    return {
        translate: function translate(definition) {
        	   return innerTranslate(asArray(definition));
        }
    };
}

if (module) {
    module.exports = contextualize;
}
