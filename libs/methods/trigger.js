'use strict';
var async = require('async');
var eventRunner = require('../event-runner');

module.exports = function(self) {
	return function trigger(eventName) {
		self = self || this;
		if(eventName) {
			eventName = eventName.toLowerCase();
		}

		return function(eventObj) {
			function eventComplete(err, data) {
				eventObj.results = data;

				// Check if the event should bubble synchronously, if so pass to
				// parent, otherwise do nothing
				if(self.props.trigger) {
					if(self.props.events && self.props.events.hasOwnProperty(eventName)) {
						if(self.props.events[eventName].sync) {
							self.props.trigger(eventName)(eventObj);
						}
					}
				}
			}

			// If there is no event handler then end right here
			if(!self._willow.events.hasOwnProperty(eventName)) {
				return eventComplete(null, {});
			}

			var asyncObj = {};
			for(var i in self._willow.events[eventName]) {
				var handler = self._willow.events[eventName][i];
				asyncObj[handler.name] = eventRunner.call(self, handler, eventObj);
			}

			// Check if the event should bubble asynchronously, if so pass to
			// parent, otherwise do nothing
			async.auto(asyncObj, eventComplete);

			if(self.props.trigger) {
				if(self.props.events && self.props.events.hasOwnProperty(eventName)) {
					if(!self.props.events[eventName].sync) {
						self.props.trigger(eventName)(eventObj);
					}
				}
			}
		};
	};
};