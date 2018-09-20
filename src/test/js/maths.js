/*global require*/
var yatest = require('./test');
//var maths = require('../../main/js/maths');

yatest('float inconsistency', function(a) {
    a.equals(0.1 + 0.2 == 0.3, false);
    a.end();
});