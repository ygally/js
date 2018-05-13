var Auditorium = require('../../main/js/Auditorium.js');
var test = require('./test.js');

test('auditorium', function(a) {
	   var audito = new Auditorium();
    var diffused = [];
    function poukav(msg) {
        diffused.push(msg);
    }
    var chann = audito.about('toto');
    chann.to(poukav);
    a.equals(diffused.length, 0,
    	   'diffused msg array should be empty');
    chann.say('hello you')('second message');
    a.equals(diffused.length, 2,
    	   '2 msgs should already have been heard');
    a.equals(diffused[0], 'hello you',
    	   'First msg is "hello you"');
    a.equals(diffused[1], 'second message',
    	   '2nd msg is "second message"');
    var secrets = [],
        refChann = audito.about('toto');
    function someoneElse(msg) {
        secrets.push(msg);
    }
    refChann.to(someoneElse);
    a.equals(secrets.length, 2,
    	   '2nd ear should got 2 msgs already');
    refChann.say('something more');
    a.equals(secrets.length, 3,
    	   'everyone should have a 3rd');
    refChann.kick(poukav);
    audito.about ('toto').say('something secret');
    a.equals(secrets.length, 4,
    	   'secret guy should have a fourth msg');
    a.equals(secrets[3], 'something secret',
    	   'secret message should be "something secret"');
    a.equals(diffused.length, 3,
    	   'poukav should not get secret msg');
    a.end();
});
