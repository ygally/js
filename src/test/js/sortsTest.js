var sorts = require('../../main/js/sorts');
var comparator = sorts.comparator;
var yatest = require('./test');

function Sportif(nb, name, pos) {
    this.nb = nb;
    this.name = name;
    this.pos = pos;
}

yatest('sort by name,nb,pos', function(a) {
    var data = [
            new Sportif(231, 'Billy', 3),
            new Sportif(456, 'Arnold', 2),
            new Sportif(47, 'Anna', 4),
            new Sportif(398, 'Gregory', 1),
        ];
    data.sort(comparator.by('name'));
    a.equals(data.map(o=>o.name).join("_"), "Anna_Arnold_Billy_Gregory");
    data.sort(comparator.by('nb'));
    a.equals(data.map(o=>o.nb).join("_"), "47_231_398_456");
    data.sort(comparator.by('pos'));
    a.equals(data.map(o=>o.name).join("_"), "Gregory_Arnold_Billy_Anna");
    a.end();
});

yatest('sort by getter', function(a) {
    var data = [
            new Sportif(231, 'Billy', 3),
            new Sportif(456, 'Arnold', 2),
            new Sportif(47, 'Anna', 4),
            new Sportif(398, 'Gregory', 1),
        ];
    data.sort(comparator.by(o => o.name.length));
    a.equals(data.map(o=>o.name).join("_"), "Anna_Billy_Arnold_Gregory");
    a.end();
});