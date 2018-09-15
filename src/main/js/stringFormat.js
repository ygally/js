/*global module*/
var EMPTY_DATA = {},
    DEFAULT_TAGS = ['[¤', '¤]'],
    REGEXP_NAMESPACE_SPLIT = /[,.]/,
    REGEXP_QUOTE = /[.*+?^${}()|[\]\\]/g;
function quote(s) {
    // $& means the whole matched string
    return (''+s).replace(REGEXP_QUOTE, '\\$&');
}
function capitalize(str) {
    return typeof str != 'string'? str:
        str.charAt(0).toUpperCase() + str.substring(1);
}
function objectProperty(o, p) {
    var getter;
    if (o[p] === undefined && p) {
        // try to find a getter method
        getter = o['get' + capitalize(p)];
    }
    return typeof getter == 'function'? getter.call(o): o[p];
}
function buildFormatter(settings) {
    var tags = settings.tags || DEFAULT_TAGS;
    var tagStart = quote(tags[0]);
    var keyMatch = '([^' + quote(tags[1].charAt(0)) + ']+)';
    var tagEnd = quote(tags[1]);
    var regexDynamicText = new RegExp(tagStart + keyMatch + tagEnd/* FIXME, 'g'*/);
    /**
     * Formate le texte donné s'il y a des zones dynamiques
     * à interpréter. S'il n'y en a pas, la fonction retourne
     * la chaine de caractères donnée.
     *
     * @param {String} text chaine de texte pouvant contenir des zones à interpréter (ex: [¤ville¤])
     * @param {Object} data data source object (pour les parties textes dynamiques).
     */
    function format(text, data) {
        if (!regexDynamicText.test(text)) {
            return text;
        }
        var dyn = RegExp.$1.split(REGEXP_NAMESPACE_SPLIT),
            l = dyn.length,
            i,
            value = data || EMPTY_DATA;
        for (i = 0; i < l; ++i) {
            value = objectProperty(value, dyn[i]);
            if (value == null) {
                // or undefined
                value = '';
            }
        }
        text = text.replace(regexDynamicText, value);
        return format(text, data);
    }
    return format;
}
var stringFormat = buildFormatter({
    tags: DEFAULT_TAGS
});
if (module) {
    stringFormat.capitalize = capitalize;
    stringFormat.build = buildFormatter;
    module.exports = stringFormat;
}