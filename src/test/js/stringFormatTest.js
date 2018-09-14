/*global module, require*/
var stringFormat = require('../../main/js/stringFormat');
var test = require('./test');

test('capitalizer', a => {
    a.equals(stringFormat.capitalize('doggyStyle'), 'DoggyStyle');
    a.equals(typeof stringFormat.capitalize({objTest:'sunny'}), 'object');
    a.equals(stringFormat.capitalize(), undefined);
});

test('no substitution source', a => {
    var msgFmt = 'hello [¤name¤]!';
    a.equals(stringFormat(msgFmt), 'hello !');
});
test('simple substitution', a => {
    var data = {name:'world'};
    var msgFmt = 'hello [¤name¤]';
    var value = stringFormat(msgFmt, data);
    a.equals(value, 'hello world');
});
test('namespace substitution', a => {
    var data = {
        mondo: {name:'world'},
        util: {exclamation:'!'}
    };
    var msgFmt = 'hello [¤mondo,name¤][¤util.exclamation¤]';
    var value = stringFormat(msgFmt, data);
    a.equals(value, 'hello world!');
});
test('str length substitution', a => {
    var data = {
        name: 'Charlie'
    };
    var msgFmt = "I'm [¤name.length¤] chars long";
    var value = stringFormat(msgFmt, data);
    a.equals(value, "I'm 7 chars long");
});
test('undefined handling', a => {
    var data = {
            animal: 'bee',
            isBig: false,
            clothe: null,
            teeths: 0,
            citation: ''
        };
    var goodMsg = "[¤animal¤],big:[¤isBig¤],wears:[¤clothe¤],speaks:[¤lang¤],teeth:[¤teeths¤],says:[¤citation¤]";
    var goodExpected = "bee,big:false,wears:,speaks:,teeth:0,says:";
    var badMsg = "[¤animal.name¤],big:[¤isBig.enough¤],wears:[¤clothe.color¤],speaks:[¤lang.language¤],teeth:[¤teeths.count¤],says:[¤citation.value¤]";
    var badExpected = ",big:,wears:,speaks:,teeth:,says:";
    a.equals(stringFormat(goodMsg, data), goodExpected);
    a.equals(stringFormat(badMsg, data), badExpected);
});
