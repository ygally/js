var GLOBAL_DBG = 1;
var PFX = '';
var logger = {
  log: function(msg) {
     console.log(PFX+msg);
  },
  error: function(msg) {
     console.error(PFX+msg);
  }
};
//helpers
var NIL;
function isString(s) {
    return typeof s === 'string';
}
function isFunction(f) {
    return typeof f === 'function';
}
function noop() {}
function pass(name, msg) {
    logger.log(
        name+': PASS'
        +(msg? ' ~~$ '+msg: '')
    );
}
function fail(name, msg) {
    logger.error(
        name+': FAIL'
        +(msg? ' ~~! '+msg: '')
    );
}
function assertEquals(
       name, msg,
       expect, actual,
       debug) {
   if (expect !== actual) {
       expect = isString(expect)?
           '"'+expect+'"': expect;
       actual = isString(actual)?
           '"'+actual+'"': actual;
       fail(name, 
          (msg? ''+msg: '')
          +' [[expect <'
          +expect+'> AND got <'
          +actual+'>]]'
       );
   } else if (GLOBAL_DBG || debug) {
       pass(name);
   }
}
var tuid = 0;
var DEFAULT_OPTS = {time:true};
function test(name, opt, process) {
   if (isFunction(name)) {
       process = name;
       name = 'test~'+(++tuid);
   } else if (isFunction(opt)) {
       process = opt;
       opt = NIL;
   }
   opt = opt || DEFAULT_OPTS;
   if (opt.skip) {
       return;
   }
   var n = 0, t0;
   function tmFromStart() {
       var now = +new Date();
       return opt.time? '[' + (now - t0) + ' ms] ': '';
   }
   var context = {
       pass: function pass(msg){
          pass(tmFromStart() + name, msg);
          context.end();
       },
       equals: function equals(
           actual, expect, msg, debug) {
           assertEquals(
               tmFromStart() + name+(n++? '['+n+']':''),
               msg,
               expect,
               actual,
               debug);
       },
       fail: function fail(msg){
          fail(tmFromStart() + name, msg);
          context.end();
       },
       // FIXME something to tell test is over
       end: noop
   };
   t0 = +new Date();
   // call test process
   process(context);
}
if (module) {
    module.exports = test;
}