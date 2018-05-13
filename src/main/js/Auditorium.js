function $consumer(msg) {
	 return function deliverTo(consume) {
	     consume(msg);
	 };
}
function $provider(consume) {
	 return function deliver(msg) {
	 	   consume(msg);
	 };
}
function $channel(){
	   var Q=[], ears=[];
	   function channel(msg) {
	       // add msg for future hearing
	 	     Q.push(msg);
	 	     // iterate on already registered ears
	 	     ears.forEach($consumer(msg));
	 	     // return the function itself
	 	     return channel;
	   }
	   // channel function alias for natural language
	   channel.say = channel;
	   // add talking methods 
	   channel.to = function addTarget(ear) {
	   	    // add new listener to ears list
	   	    ears.push(ear);
	   	    // iterate on msg queue
	   	    Q.forEach($provider(ear));
	   	    // return the function itself
	 	      return channel;
	   };
	   channel.kick = function kickTarget(ear) {
	   	    ear = ears.indexOf(ear);
	   	    if (ear >= 0) {
	   	    	   ears.splice(ear, 1);
	   	    }
	   	    return channel;
	   	};
	   // ret the channel provider/consumer
	   return channel;
}
function Auditorium() {
    var map = {};
    this.about = function about(c) {
	   	    return (map[c]=(map[c]||$channel()));
	   };
}
if (module) {
    module.exports = Auditorium;
}
