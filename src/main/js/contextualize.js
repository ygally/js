var LEN = 'length',
    RE_FMT = "[{][{]K[}][}]",
    DEFAULT_RE = new RegExp(RE_FMT.replace("K", "([^}]+)")),
    UNDEFINED,
    isArray = Array.isArray;
function collect(obj){
    return function(kvPair) {
        obj[kvPair.key] = kvPair.value;
    };
}
function get(D, req) {
    if (req) {
        if (isArray(req)) {
            if (req[LEN]) {
                var R = get(D, req[0]);
                return R !== UNDEFINED?
                    R:
                    get(D,req.splice(1));
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
    function translate(def) {
        if (isArray(def)) {
            var accu = {};
            def.map(translate)
                .forEach(collect(accu));
            return accu;
        } 
        return {
            key: def.name,
            value: def.text ?
                expFrom(D, def.text, RE || DEFAULT_RE):
                get(D, def.req)
        };
    }
    return {
        translate: translate
    };
}

if (module) {
    module.exports = contextualize;
}
