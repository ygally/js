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
function get(data, req, type, fmt) {
    var R;
    if (req) {
        if (isArray(req)) {
            if (req.length) {
                R = get(data, req[0], type, fmt);
                return R !== UNDEFINED?
                    R:
                    get(data, req.slice(1), type, fmt);
            }
            return UNDEFINED;
        }
	       R = data[req];
	       if (R === UNDEFINED) {
	           return R;
	       	}
	       type = type && types[type] || identity;
        R = type(R);
        return (fmt||identity)(R);
    }
}
function expFrom(data, T, RE) {
    if (RE.test(T)) {
        var R = RegExp.$1, 
            pattern = RE_FMT.replace("K", R);
        pattern = new RegExp(pattern, "g");
        T = T.replace(pattern, get(data, R));
        return expFrom(data, T, RE);
    }
    return T;
}
function collectInto(result) {
    return function(kvPair) {
        result[kvPair[0]] = kvPair[1];
    };
}
function contextualize(data, RE) {
    function innerTranslate(definition) {
        if (isArray(definition)) {
            var result = {};
            definition.map(innerTranslate)
                .forEach(collectInto(result));
            return result;
        } 
        return [definition.name, definition.text?
            expFrom(data, definition.text, RE || DEFAULT_RE):
            get(data, definition.require || definition.req, definition.type, definition.fmt)
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
