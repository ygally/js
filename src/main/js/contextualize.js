var formatSettings = {tags: ["{{", "}}"]},
    stringFormat = require('./stringFormat').build(formatSettings),
    isArray = Array.isArray,
    NIL;
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
                return value !== NIL? value:
                    get(data, key.slice(1), type, fmt);
            }
            return NIL;
        }
	       value = data[key];
	       if (value === NIL) {
	           return value;
	       	}
	       type = type && types[type] || identity;
        value = type(value);
        return (fmt||identity)(value);
    }
}
function collectInto(result) {
    return function resultCollector(kvPair) {
        result[kvPair[0]] = kvPair[1];
    };
}
function contextualize(data) {
    function innerTranslate(definition) {
        if (isArray(definition)) {
            var result = {};
            definition.map(innerTranslate)
                .forEach(collectInto(result));
            return result;
        } 
        return [definition.name, definition.text?
            stringFormat(definition.text, data):
            get(data, definition.require || definition.required || definition.req, definition.type, definition.fmt)
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