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
function get(data, key, type, fmt) {
    var value;
    if (key) {
        if (isArray(key)) {
            if (key.length) {
                value = get(data, key[0], type, fmt);
                return value !== UNDEFINED? value:
                    get(data, key.slice(1), type, fmt);
            }
            return UNDEFINED;
        }
	       value = data[key];
	       if (value === UNDEFINED) {
	           return value;
	       	}
	       type = type && types[type] || identity;
        value = type(value);
        return (fmt||identity)(value);
    }
}
function expFrom(data, text, RE) {
    if (RE.test(text)) {
        var key = RegExp.$1,
            pattern = RE_FMT.replace("K", key);
        pattern = new RegExp(pattern, "g");
        text = text.replace(pattern, get(data, key));
        return expFrom(data, text, RE);
    }
    return text;
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
