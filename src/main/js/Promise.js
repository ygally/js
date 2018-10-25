/*global module */

// helpers definition
var NIL;
// function that does nothing...
// It is still a function, that is the point
function noop() {}
function isString(s) {
    return typeof s === 'string';
}
function isFunction(f) {
    return typeof f === 'function';
}
function isObject(o) {
    o = typeof o;
    return o === 'object' || o === 'function';
}
function getFunction(f) {
    return isFunction(f)? f: noop;
}

function give(data) {
    return function giveData() { return data; };
}

/**
* Check if a value is a Promise and, if it is,
* return the `then` method of that promise.
*
* @param {Promise|Any} value
* @return {Function|undefined}
*/
function getThen(o) {
    // avoid NullPointerAccess
    if (o && isObject(o)) {
    // look for 'then' func or return undefined
        return isFunction(o.then)? o.then: NIL;
    }
    // no return is same as undefined
}

/**
* Take a potentially misbehaving resolver function and make sure
* onDone and onFail are only called once.
*
* Makes no guarantees about asynchrony.
*
* @param {Function} cl A resolver function that may not be trusted
* @param {Function} onDone
* @param {Function} onFail
*/
function doResolve(cl, onDone, onFail) {
    var still = 1;
    function fulfill(data) {
        if (still) {
               still = 0;
               onDone(data);
        }
    }
    function reject(err) {
        if (still) {
             still = 0;
             onFail(err);
         }
    }
    try {
        cl(fulfill, reject);
    } catch (e) {
        reject(e);
    }
}

/**
* converts one no-argument function to
* an action function that can be used
* with Promise constructor.
*
* NOTA : there is no other fail case than
* throwing exception...
*/
function $callable(func) {
    return function callableFunc(resolve) {
         resolve(func());
     };
}

// states
// WAIT = 0 = undefined
var YES = 1;
var NO = 2;
var puid = Math.random()*1e4;
puid = Math.round(puid);

function Promise(cl, name) {
var self = this;
self.name = name;
  // store state which can be
  // WAIT, YES or NO
  var state;
  // store value once YES or NO
  var data;
  // store sucess & failure handlers
  var handlers = [];

  function handle(handler) {
      if (state === YES) {
          handler.onDone(data);
      } else if (state === NO) {
          handler.onFail(data);
      } else {
          handlers.push(handler);
      }
  }

  function gYa(d) {
     state = YES;
     data = d;
     handlers.forEach(handle);
     handlers = NIL;
  }

  function gNo(error) {
     state = NO;
     data = error;
     handlers.forEach(handle);
     handlers = NIL;
  }

  function solve(res) {
    try {
       var then = getThen(res);
       if (then) {
              doResolve(then.bind(res), solve, gNo);
       } else {
          gYa(res);
       }
    } catch (e) {
       gNo(e);
    }
  }

  // direct call to given function
  // NOTA: this is a synchronous call
  doResolve(cl, solve, gNo);

  // classic callback manage~t (ok & fail)
  self.done = function done(onDone, onFail) {
      // ensure we are always asynchronous
      setTimeout(handle.bind(NIL, {
          onDone: getFunction(onDone),
          onFail: getFunction(onFail)
      }), 1);
  };

  // Proprietary fork impl
  self.fork = function fork() {
    // NOTA: this will exec 'cl' function again
    return new Promise(cl, 'fork~'+(puid++));
  };
}
// ####################
//      Prototype extensions
// ####################
var promProto = Promise.prototype;

/**
* Creates a trigger function.
* If a transform function is given, the
* trigger will apply it on the data he
* will hook.
* Then one of answering functions is
* called (yes, no, default) according to
* what happens.
*/
function $trigger(transform, ya, no, defolt) {
    return function dataTrigger(data) {
        try {
            if (isFunction(transform)) {
                data = transform(data);
                ya(data);
            } else {
                defolt(data);
            }
        } catch (error) {
            no(error);
        }
    };
}

// Prom style 'then' callback handling & syn
promProto.then =
   function then(onDone, onFail, name) {
      var self = this;
      return new Promise(function thenPromDefine(ya, no) {
          self.done(
             $trigger(onDone, ya, no, ya, self),
             $trigger(onFail, ya, no, no, self)
          );
      },
      name || ('then~'+(puid++)));
  };
// Prom style 'catch' callback handling & syn
promProto['catch'] = promProto.or =
   function or(onFail, name) {
      return this.then(NIL, onFail,
          name || ('catch~'+(puid++)));
   };
// Proprietary retry impl
function retry(promise, retries, errors) {
    return promise.then(function retryOnDone(data) {
       // when prom succeeds, return data
       return data;
       // FIXME find a way of giving access to errors when finally successfully
  }).or(function retryOnFail(e) {
      // when reject occurs, push msg in list
       errors.push(e);
       // and if there is more retries...
       if (retries>0) {
          // ...recurse with Promise duplicate
          return retry(
            promise.fork(),
            retries - 1,
            errors);
       }
       //...Or answer w/o data if it is over
       throw errors;
    });
}
// delegates to private function
promProto.retry = function publicRetry(max) {
   return retry(this, max, []);
};

// static plugins
function isPromise(p) {
   return p && p.constructor === Promise;
}

function resolve(obj) {
  if (obj) {
     if (isFunction(obj)) {
         return new Promise(
            $callable(obj),
            'resolved~fct~'+(puid++)
         );
     }
     if (isPromise(obj)) { return obj; }
  }
  return new Promise(
     function resolvePromDefine(ya) { ya(obj); },
      'resolved~val~'+(puid++)
    );
}
function reject(obj) {
  return new Promise(
     function rejectPromDefine(ya, no) { no(obj); },
     'rejected~val~'+(puid++)
  );
}
function chainAction(any, store, nextP) {
   // creates an action that will receive
   // the pidgin responsible for the
   // results transport...
   return function chainedAction(pidgin, fail) {
    // action is to wait for the given
    // Promise is done
      return resolve(any)
         .done(function chainOnDone(data) {
            // add prom result to storage
            store.push(data);
            // transmit pidgin to next action
            return nextP(pidgin, fail);
         }, fail);
  };
}

var SECOND = 1E3;
function wait(tm, tmUnit) {
  return new Promise(function(ya) {
   tm = (tm || 0) * (tmUnit || SECOND);
      if (tm>0) {
         setTimeout(ya, tm);
      } else {
        ya();
      }
   }, 'delayed~'+(puid++));
}

function $deliveryCallable(store, f) {
   if (isPromise(f)) {
       return function(ya) {
          f.done(function(data) {
              ya(store.push(data));
          });
       };
   }
   if (!isFunction(f)) {
       // if not a function, wrap data into one
       f = give(f);
   }
   return function(ya) {
       ya(store.push(f()));
   };
}
function $delivery(store, f) {
   if (isPromise(f)) {
       return f.then(function(d) {
          store.push(d);
       });
   }
   if (!isFunction(f)) {
       // if not a function, wrap data into one
       f = give(f);
   }
   return function (){
       return store.push(f());
   };
}

function seq(actions) {
    actions = actions || [];
   var store = [], prom, a=0, nextAction,
   cnt = actions.length;
   if (cnt) {
       // create a first prom
       prom = new Promise(
           $deliveryCallable(
               store,
               actions[a++]
           )
       );
       while (a<cnt) {
           // and chain one more
           // until end of array
           prom = prom.then(
               $delivery(
                   store,
                    actions[a++]
               )
           );
       }
       prom = prom.then(give(store));
   } else {
       prom = resolve(store);
   }
   // wait for last prom and return store
   return prom;
}
function all(promises, name) {
    promises = promises || [];
   var store = [], n = promises.length;
   var action = function allAction(ya) {
       ya(store);
   };
   while (n) {
       // chain last defined action
       // with the previous one
       action = chainAction(
          promises[--n],
          store,
          action
       );
     }
   return new Promise(action,
           name || ('all~'+(puid++)));
}

function race(promises, name) {
  return new Promise(function racePromDefine(ya, no) {
     if (!promises || !promises.forEach) {
         no('No promise array!');
     } else {
         promises.forEach(function raceEachPromOnDone(prom) {
            resolve(prom).done(ya, no);
         });
     }
  }, name || ('race~'+(puid++)));
}

Promise.isPromise = isPromise;
Promise.resolve = resolve;
Promise.reject = reject;
Promise.wait = wait;
Promise.seq = seq;
Promise.all = all;
Promise.race = race;

if (module) {
    module.exports = Promise;
}
