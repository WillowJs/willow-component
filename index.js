'use strict';

// // .bind polyfill
// if (!Function.prototype.bind) {
//   Function.prototype.bind = function(oThis) {
//     if (typeof this !== 'function') {
//       // closest thing possible to the ECMAScript 5
//       // internal IsCallable function
//       throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
//     }

//     var aArgs = Array.prototype.slice.call(arguments, 1),
//         fToBind = this,
//         FNOP = function() {},
//         fBound = function() {
//           return fToBind.apply(this instanceof FNOP
//                  ? this
//                  : oThis,
//                  aArgs.concat(Array.prototype.slice.call(arguments)));
//         };

//     FNOP.prototype = this.prototype;
//     fBound.prototype = new FNOP();

//     return fBound;
//   };
// }

var React = require('react');
var _ = require('lodash');
var eventRunner = require('./libs/event-runner');

var WillowMethods = {
	on: require('./libs/methods/on'),
	trigger: require('./libs/methods/trigger'),
	require: function(self) {
		return function() {
			self = self || this;
			console.log('require', self, self._willow);
			return this;
		}
	}
};

module.exports = {
	createClass: createClass
};

function createClass(obj) {

	// Fill in a render method
	if(!obj.render) {
		obj.render = function() {
			return <h1>No render method implemented</h1>;
		};
	}

	// Build out the child component

	var ChildClass = React.createClass(obj);

	var ParentClass = React.createClass({
		componentWillMount: function() {
			// ... code goes here
			this._willow = _.cloneDeep(
				Object.getPrototypeOf ? Object.getPrototypeOf(this)._willow : this.__proto__._willow
			);
			this.on = WillowMethods.on();
			this.trigger = WillowMethods.trigger();
			this.require = WillowMethods.require();
			ChildClass.prototype.on = WillowMethods.on(this);
			ChildClass.prototype.trigger = WillowMethods.trigger(this);
			ChildClass.prototype.require = WillowMethods.require(this);
		},
		getInitialState: function() {
			return {
				'iden': 'PARENT!!!'
			};
		},
		render: function() {
			return <ChildClass {...this.props} iden="CHILD!!!" />;
		}
	});

	// class methods
	ParentClass.on = WillowMethods.on(ParentClass.prototype);
	ParentClass.require = WillowMethods.require(ParentClass.prototype);

	// instance methods
	// ParentClass.prototype.on = WillowMethods.on(null, 'ParentClass.prototype.on');
	// ParentClass.prototype.trigger = WillowMethods.trigger();
	// ParentClass.prototype.require = WillowMethods.require();
	ParentClass.prototype._willow = { events: {} };

	return ParentClass;
	// Child.prototype.trigger = function(eventName) {
	// 	console.log('trigger', eventName);
	// 	var self = this;
	// 	eventName = eventName.toLowerCase();

	// 	return function(eventObj) {
	// 		function eventComplete(err, data) {
	// 			console.log('eventComplete');
	// 			eventObj.results = data;

	// 			// Check if the event should bubble synchronously, if so pass to
	// 			// parent, otherwise do nothing
	// 			if(self.props.trigger) {
	// 				if(self.props.events && self.props.events.hasOwnProperty(eventName)) {
	// 					if(self.props.events[eventName].sync) {
	// 						self.props.trigger(eventName)(eventObj);
	// 					}
	// 				}
	// 			}
	// 		}

	// 		// If there is no event handler then end right here
	// 		if(!self._willow.events.hasOwnProperty(eventName)) {
	// 			console.log(1);
	// 			return eventComplete(null, {});
	// 		}

	// 		var asyncObj = {};
	// 		for(var i in self._willow.events[eventName]) {
	// 			var handler = self._willow.events[eventName][i];
	// 			asyncObj[handler.name] = eventRunner.call(self, handler, eventObj);
	// 		}

	// 		async.auto(asyncObj, eventComplete);

	// 		// Check if the event should bubble asynchronously, if so pass to
	// 		// parent, otherwise do nothing
	// 		// console.log('self', self, self.props);
	// 		if(self.props.trigger) {
	// 			console.log(2);
	// 			if(self.props.events && self.props.events.hasOwnProperty(eventName)) {
	// 				if(!self.props.events[eventName].sync) {
	// 					self.props.trigger(eventName)(eventObj);
	// 				}
	// 			}
	// 		}
	// 	};
	// };

}

// class methods
// component methods


// function trigger(eventName) {
// 	console.log('trigger', eventName);
// 	var self = this;
// 	eventName = eventName.toLowerCase();

// 	return function(eventObj) {
// 		function eventComplete(err, data) {
// 			console.log('eventComplete');
// 			eventObj.results = data;

// 			// Check if the event should bubble synchronously, if so pass to
// 			// parent, otherwise do nothing
// 			if(self.props.trigger) {
// 				if(self.props.events && self.props.events.hasOwnProperty(eventName)) {
// 					if(self.props.events[eventName].sync) {
// 						self.props.trigger(eventName)(eventObj);
// 					}
// 				}
// 			}
// 		}

// 		// If there is no event handler then end right here
// 		if(!self._willow.events.hasOwnProperty(eventName)) {
// 			console.log(1);
// 			return eventComplete(null, {});
// 		}

// 		var asyncObj = {};
// 		for(var i in self._willow.events[eventName]) {
// 			var handler = self._willow.events[eventName][i];
// 			asyncObj[handler.name] = eventRunner.call(self, handler, eventObj);
// 		}

// 		async.auto(asyncObj, eventComplete);

// 		// Check if the event should bubble asynchronously, if so pass to
// 		// parent, otherwise do nothing
// 		// console.log('self', self, self.props);
// 		if(self.props.trigger) {
// 			console.log(2);
// 			if(self.props.events && self.props.events.hasOwnProperty(eventName)) {
// 				if(!self.props.events[eventName].sync) {
// 					self.props.trigger(eventName)(eventObj);
// 				}
// 			}
// 		}
// 	};
// };