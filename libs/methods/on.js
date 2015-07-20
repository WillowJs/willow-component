'use strict';
var WillowError = require('willow-error');
var validateHandler = require('../validation/handler');
module.exports = function(self) {
	return function(name, handler) {
		self = self || this;
		if(!name) {
			throw new WillowError(
				'An event name is required',
				500,
				'NOEVENTNAME'
			);
		}

		name = name.toLowerCase();
		if(!self._willow.events.hasOwnProperty(name)) {
			self._willow.events[name] = {};
		}

		handler.method = handler.method || 'local';
		handler.dependencies = handler.dependencies || [];
		handler.middleware = handler.middleware || [];

		var error = validateHandler(handler);

		if(error) {
			throw error;
		}

		if(self._willow.events[name].hasOwnProperty(handler.name.toLowerCase())) {
			console.warn(
				'Event "'+name+'" handler "'+handler.name+
				'" already exists. We are updating the current \
				handler rather than adding a new one.'
			);
		}

		self._willow.events[name][handler.name.toLowerCase()] = handler;

		return this; // for chaining
	};
};