var validateHandler = require('./validation/validateHandler');
var validateRequire = require('./validation/validateRequire');

module.exports = function() {
	var _events = {};
	var _contents = {};
	var _requires = {};
	var _metadata = function() {

	};
	var _config = {};

	/*
	 * For adding event handlers
	 */
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

	/*
	 * For adding url specific metadata
	 */
	this.metadata = function(fnOrObj) {
		if(_.isFunction(fnOrObj)) {
			_metadata = fnOrObj;
			return this;
		}
		else {
			return _metadata(fnOrObj);
		}
	};

	this.require = function(varName, modName, context) {
		context = context.toLowerCase();
		var error = validateRequire(varName, modName, context);
		if(error) {
			throw error;
		}

		_requires[context][varName] = modName;

		return this;

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

		return _events[eventName][handler].run(
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
	this.toString = require('./on');
	this.trigger = require('./on');

};