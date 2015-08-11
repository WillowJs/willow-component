'use strict';
var WillowError = require('willow-error');
var validateHandler = require('./validation/handler');
var validateRequire = require('./validation/require');
var validateConfig = require('./validation/config');
var _ = require('./lodash/lodash.custom.js');
var async = require('async');
var eventRunner = require('./event-runner');

var WillowState = function(_contents, _events, _metadata, _requires, _config) {
	_contents = _contents || {};
	_events = _events || {};
	_metadata = _metadata || function() {};
	_requires = _requires || {};
	_config = _config || {};

	this.require = _requires;
	this.config = _config;

	var _context = {
		requires: {
			both: {},
			server: {},
			client: {}
		},
		config: {
			both: {},
			server: {},
			client: {}
		}
	};

	// Contents
	this.setContents = function(contents) {
		_contents = contents;
	};

	this.getContents = function() {
		return _contents;
	};

	// Events
	this.setEvents = function(events) {
		_events = events;
	};

	this.getEvents = function() {
		return _events;
	};

	// Metadata
	this.setMetadata = function(fn) {
		_metadata = fn;
	};

	this.getMetadata = function(obj) {
		return _metadata;
	};

	this.addMetadata = function(fn) {
		if(!_.isFunction(fn)) {
			throw new WillowError(
				'Argument must be a function',
				400,
				'NONFUNCTION'
			);
		}
		_metadata = fn;
		return this;
	};

	this.calculateMetadata = function(input) {
		if(_.isFunction(_metadata)) {
			return _metadata(input);
		}
		return undefined;
	};

	// Requires
	this.setRequires = function(requires) {
		_requires = requires;
		this.require = _requires;
	};

	this.getRequires = function() {
		return _requires;
	};

	this.addRequire = function(key, modName, context) {
		var error = validateRequire(key, modName, context);
		if(error) {
			throw error;
		}

		context = context.toLowerCase();

		_context.requires[context][key] = modName;

		return this;
	};

	// Config
	this.setConfig = function(config) {
		_config = config;
		this.config = _config;
	};

	this.getConfig = function() {
		return _config;
	};

	this.addConfig = function(key, value, context) {
		var error = validateConfig(key, value, context);
		if(error) {
			throw error;
		}

		context = context.toLowerCase();

		_context.config[context][key] = value;

		return this;
	};

	// Other Methods

	this.on = function(name, handler) {
		if(!name) {
			throw new WillowError(
				'An event name is required',
				500,
				'NOEVENTNAME'
			);
		}

		name = name.toLowerCase();
		if(!_events.hasOwnProperty(name)) {
			_events[name] = {};
		}

		handler.method = handler.method || 'local';
		handler.dependencies = handler.dependencies || [];
		handler.middleware = handler.middleware || [];

		var error = validateHandler(handler);

		if(error) {
			throw error;
		}

		if(_events[name].hasOwnProperty(handler.name.toLowerCase())) {
			console.warn(
				'Event "'+name+'" handler "'+handler.name+
				'" already exists. We are updating the current \
				handler rather than adding a new one.'
			);
		}

		_events[name][handler.name.toLowerCase()] = handler;

		return this; // for chaining
	};

	this.trigger = function(node, eventName, eventObj) {
		if(!node) {
			throw new WillowError(
				'The trigger method was called without a react node.',
				{},
				400,
				'NONODE'
			);
		}

		if(!eventName) {
			throw new WillowError(
				'The trigger method was called without an event name.',
				{},
				400,
				'NOEVENT'
			);
		}

		if(!_.isString(eventName)) {
			throw new WillowError(
				'The event name was expected to be a string.',
				{},
				400,
				'BADEVENT'
			);
		}

		eventName = eventName.toLowerCase();
		eventObj = eventObj || {};

		function eventComplete(err, data) {
			eventObj.results = data;

			// Check if the event should bubble synchronously, if so pass to
			// parent, otherwise do nothing
			if(node.props.trigger) {
				if(node.props.events && node.props.events.hasOwnProperty(eventName)) {
					if(node.props.events[eventName].sync) {
						node.props.trigger.call(node, eventName)(eventObj);
					}
				}
			}
		}

		// If there is no event handler then end right here
		if(!_events.hasOwnProperty(eventName)) {
			return eventComplete(null, {});
		}

		var asyncObj = {};
		for(var i in _events[eventName]) {
			var handler = _events[eventName][i];
			asyncObj[handler.name] = eventRunner.call(node, handler, eventObj);
		}

		// Check if the event should bubble asynchronously, if so pass to
		// parent, otherwise do nothing
		async.auto(asyncObj, eventComplete);

		if(node.props.trigger) {
			if(node.props.events && node.props.events.hasOwnProperty(eventName)) {
				if(!node.props.events[eventName].sync) {
					node.props.trigger.call(node, eventName)(eventObj);
				}
			}
		}
	};

	this.clone = function() {
		return new WillowState(
			_.cloneDeep(_contents),
			_.cloneDeep(_events),
			_.cloneDeep(_metadata),
			_.cloneDeep(_requires),
			_.cloneDeep(_config)
		);
	};

	this.run = function(eventName, handler, eventObj, actualMethod, resolve, reject) {
		eventName = eventName.toLowerCase();
		if(!_events.hasOwnProperty(eventName)) {
			return reject(new WillowError(
				'Component has no event {{event}}.',
				{event: eventName},
				404,
				'NOEVENT'
			));
		}
		if(!_events[eventName].hasOwnProperty(handler)) {
			return reject(new WillowError(
				'Component has no handler {{event}}/{{handler}}.',
				{event: eventName, handler: handler},
				404,
				'NOHANDLER'
			));
		}
		if(_events[eventName][handler].method !== actualMethod.toLowerCase()) {
			return reject(new WillowError(
				'run(...) call expected {{expectedMethod}} but {{event}}/{{handler}} has method {{actualMethod}}.',
				{
					event: eventName,
					handler: handler,
					expectedMethod: _events[eventName][handler].method,
					actualMethod: actualMethod
				},
				400,
				'BADCALL'
			));
		}

		return _events[eventName][handler].run.call(
			this,
			eventObj,
			// resolve
			function(data) {
				var result = {};
				result[handler] = data;
				return resolve(result);
			},
			// reject
			reject
		);
	};

	this.hasHandler = function(eventName, handler) {
		if(!eventName || !handler) {
			return false;
		}

		eventName = eventName.toLowerCase();

		if(!_events.hasOwnProperty(eventName)) {
			return false;
		}
		if(!_events[eventName].hasOwnProperty(handler)) {
			return false;
		}
		return true;
	};

	// this.loadServerRequires = function() {
	// 	if (typeof process !== 'object' || process.browser) {
	// 		throw new WillowError(
	// 			'loadServerRequires can only be called from the server.',
	// 			{},
	// 			400,
	// 			'SERVERONLY'
	// 		);
	// 	}
	// 	var path = require('path');
	// 	var filePath = '';
	// 	for(var i in _requires.both) {
	// 		filePath = _requires.both[i];
	// 		if(filePath.charAt(0) === '.') {
	// 			filePath = path.resolve(
	// 				path.dirname(module.parent.parent.filename),
	// 				filePath
	// 			);
	// 		}
	// 		this.loadRequire(i, require(filePath));
	// 	}
	// 	for(var j in _requires.server) {
	// 		filePath = _requires.server[j];
	// 		if(filePath.charAt(0) === '.') {
	// 			filePath = path.resolve(
	// 				path.dirname(module.parent.parent.filename),
	// 				filePath
	// 			);
	// 		}
	// 		this.loadRequire(j, require(filePath));
	// 	}
	// };
};

module.exports = WillowState;