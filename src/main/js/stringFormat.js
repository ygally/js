// Constantes textes
var EMPTY_DATA = {},
    // Expression de reconnaissance des zones dynamiques de texte
    REGEXP_DYN_TEXT = /\[¤([^¤]+)¤\]/,
    // Expression de séparation des zones multiples (texte dynamique)
    REGEXP_SPLIT = /[,.]/;
function capitalize(s) {
    return typeof s == 'string'? 
        s.charAt(0).toUpperCase() + s.substring(1):
        s;
}
function objectProperty(o, p) {
    var getter;
    if (o[p] === undefined && p) {
        // try to be a getter method
        getter = o['get' + capitalize(p)];
    }
    return typeof getter == 'function'? getter.call(o): o[p];
}
/**
 * Formate le texte donné s'il y a des zones dynamiques
 * à interpréter. S'il n'y en a pas, la fonction retourne
 * la chaine de caractères donnée.
 *
 * @param {String} text chaine de texte pouvant contenir des zones à interpréter (ex: [¤ville¤])
 * @param {Object} data data source object (pour les parties textes dynamiques).
 */
function stringFormat(text, data) {
    if (!REGEXP_DYN_TEXT.test(text)) {
        return text;
    }
    var dyn = RegExp.$1.split(REGEXP_SPLIT),
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
    text = text.replace(REGEXP_DYN_TEXT, value);
    return stringFormat(text, data);
}
if (module) {
    stringFormat.capitalize = capitalize;
    module.exports = stringFormat;
}
