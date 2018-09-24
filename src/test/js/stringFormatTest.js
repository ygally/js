/*global module, require*/
var stringFormat = require('../../main/js/stringFormat');
var test = require('./test');

test('capitalizer', a => {
    a.equals(stringFormat.capitalize('doggyStyle'), 'DoggyStyle');
    a.equals(stringFormat.capitalize(), undefined);
    a.equals(typeof stringFormat.capitalize({objTest:'sunny'}), 'object');
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

test('mustache format substitution', a => {
    var mustacheSettings = {tags: ['{{', '}}']};
    var mustacheFormat = stringFormat.build(mustacheSettings);
    var MODEL = {name: 'Yaya'};
    var msgFmt = 'hello {{name}} !';
    var text = mustacheFormat(msgFmt, MODEL);
    a.equals(text, 'hello Yaya !');
});

test('shell format substitution', a => {
    var shSettings = {tags: ['${', '}']};
    var shFormat = stringFormat.build(shSettings);
    var MODEL = {name: 'Yaya'};
    var msgFmt = 'hello ${name} !';
    var text = shFormat(msgFmt, MODEL);
    a.equals(text, 'hello Yaya !');
});

test('smartGetters opt OFF subst.', a => {
    var MODEL = {skill1: 'algo', getSkill2: ()=>'js'};
    var msgFmt = '[¤skill1¤] [¤skill2¤]';
    var text = stringFormat(msgFmt, MODEL);
    a.equals(text, 'algo ');
});

test('smartGetters opt ON subst.', a => {
    var smartSettings = {smartGetters: true};
    var sFormat = stringFormat.build(smartSettings);
    var MODEL = {skill1: 'algo', getSkill2: ()=>'js'};
    var msgFmt = '[¤skill1¤] AND [¤skill2¤]';
    var text = sFormat(msgFmt, MODEL);
    a.equals(text, 'algo AND js');
});

test('smartGetters opt. do not override real prop', a => {
    var smartSettings = {smartGetters: true};
    var sFormat = stringFormat.build(smartSettings);
    var MODEL = {skill1: 'algo', getSkill1: ()=>'js'};
    var msgFmt = '[¤skill1¤]';
    var text = sFormat(msgFmt, MODEL);
    a.equals(text, 'algo');
});