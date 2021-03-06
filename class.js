var WillowError = require('willow-error');
var React = require('react');
var validator = require('validator');
var _ = require('lodash');
var underscoreDeepExtend = require('underscore-deep-extend');
var async = require('async');
var eventRunner = require('./libs/event-runner');

_.mixin({deepExtend: underscoreDeepExtend(_)});

function WillowComponent(_contents, _events, _metadata, _requires) {
	_contents = _contents || {};
	_events = _events || {};
	_metadata = _metadata || function(url) { return {}; };
	_requires = _requires || {
		client: {},
		server: {},
		both: {}
	};
	this.require = function(varName, modName, context) {
		// @todo what happens when the component I'm extending from shares a varName
		context = context.toLowerCase();
		var error = validateRequire(varName, modName, context);
		if(error) {
			throw error;
		}

		_requires[context][varName] = modName;

		return this;

	};

	this.requires = function() {
		return _requires;
	};

	this.on = function(name, handler) {
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
	this.extend = function(contents) {
		var extendFrom = _.cloneDeep(_contents);
		var newObj = _.deepExtend(extendFrom, contents);
		if(!newObj.hasOwnProperty('mixins')) {
			newObj.mixins = [];
		}
		var newEvents = _.cloneDeep(_events);
		var newRequires = _.cloneDeep(_requires);

		var found = _.find(newObj.mixins, function(mixin) {
			return mixin.trigger;
		});
		if(!found) {
			newObj.mixins.push({
				trigger: trigger,
				on: this.on
			});
		}

		var newComponent = new WillowComponent(
			newObj,
			newEvents,
			_metadata,
			newRequires
		);
		return newComponent;
	};
	this.build = function() {
		// @todo there must be a better way of doing this...
		var reactClass =  React.createClass(_contents);
		reactClass.prototype.willow = {
			events: {
				handlers: _events
			}
		};
		return reactClass;
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

	this.peek = function() {
		if(!global.sinon) {
			throw 'Peek can only be used in debug mode. Set global.willow_debug = true';
		}
		return _contents;
	};

	this.metadata = function(fnOrObj) {
		if(_.isFunction(fnOrObj)) {
			_metadata = fnOrObj;
			return this;
		}
		else {
			return _metadata(fnOrObj);
		}
	};

	this.toString = function(localOnly) {
		// Recurse function
		function recurse(target) {
			if(_.isFunction(target)) {
				return target.toString();
			}
			else if(_.isArray(target)) {
				var pieces = [];
				for(var i=0; i < target.length; i++) {
					pieces.push(recurse(target[i]));
				}
				return '['+pieces.join(',')+']';
			}
			else if(_.isObject(target)) {
				var result = '{';
				for(var j in target) {
					result += '\''+j+'\':' + recurse(target[j])+',';
				}
				result = result.substring(0, result.length-1) + '}';
				return result;
			}
			else if(_.isString(target)) {
				return '"'+target.toString()+'"';
			}
			else {
				return target.toString();
			}
		}

		var results = '{';

		// Contents
		results += 'contents: ' + recurse(_contents);

		// Events
		results += ', events: ';
		var eventPieces = [];
		for(var i in _events) {
			var handlerPieces = [];
			for(var j in _events[i]) {
				if(!localOnly || (localOnly && _events[i][j].method.toLowerCase() === 'local')) {
					handlerPieces.push('\''+j+'\': ' + recurse(_events[i][j]));
				}
			}
			eventPieces.push('\''+i+'\': {'+handlerPieces.join(',') + '}');
		}

		results += '{' + eventPieces.join(',') + '}, metadata: '+_metadata.toString();
		results += ', requires: ' + JSON.stringify(_requires) + '}';

		return results;
	};

	function validateRequire(varName, modName, context) {
		if(!varName) {
			return new WillowError(
				'A variable name is required',
				400,
				'NOVARNAME'
			);
		}

		if(!_.isString(varName)) {
			return new WillowError(
				'Variable names must be strings',
				400,
				'BADVARNAME'
			);
		}

		if(!modName) {
			return new WillowError(
				'A module to include must be specified',
				400,
				'NOMODNAME'
			);
		}

		if(!_.isString(modName)) {
			return new WillowError(
				'Module names must be strings',
				400,
				'BADMODNAME'
			);
		}

		if(!context) {
			return new WillowError(
				'A context is require ("client" or "server" or "both")',
				400,
				'NOCONTEXT'
			);
		}

		if(!_.isString(context)) {
			return new WillowError(
				'Context must be a string',
				400,
				'BADCONTEXT'
			);
		}

		context = context.toLowerCase();

		if(!validator.isIn(context, ['client', 'server', 'both'])) {
			return new WillowError(
				'Context must be either "client", "server" or "both"',
				400,
				'INVALIDCONTEXT'
			);
		}

		return false;
	}

	function validateHandler(handler) {
		if(!handler.name) {
			return new WillowError(
				'An event handler name is required',
				400,
				'NONAME'
			);
		}
		var validMethod = validator.isIn(
			handler.method.toLowerCase(),
			['local', 'get', 'post', 'put', 'delete']
		);
		if(!validMethod) {
			return new WillowError(
				'Invalid method "{method}"',
				{method: handler.method},
				400,
				'BADMETHOD'
			);
		}
		if(!_.isArray(handler.dependencies)) {
			return new WillowError(
				'`dependencies` property must be an array',
				400,
				'BADDEPS'
			);
		}
		for(var i=0; i < handler.dependencies.length; i++) {
			if(!_.isString(handler.dependencies[i])) {
				return new WillowError(
					'All dependencies must be strings',
					400,
					'BADDEPS'
				);
			}
		}
		if(!_.isFunction(handler.run)) {
			return new WillowError(
				'`run` property must be a function',
				400,
				'BADRUN'
			);
		}

		return false;
	}

	function trigger(eventName, eventObj) {
		var self = this;
		eventName = eventName.toLowerCase();

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
			if(!self.willow.events.handlers.hasOwnProperty(eventName)) {
				return eventComplete(null, {});
			}

			var asyncObj = {};
			for(var i in self.willow.events.handlers[eventName]) {
				var handler = self.willow.events.handlers[eventName][i];
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
	}
}

module.exports = WillowComponent;