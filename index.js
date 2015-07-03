var WillowError = require('willow-error');
var validator = require('validator');
var _ = require('lodash');
var underscoreDeepExtend = require('underscore-deep-extend');

_.mixin({deepExtend: underscoreDeepExtend(_)});

function WillowComponent(_contents, _events, isBaseClass) {
	_contents = _contents || {};
	_events = _events || {};
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
		var extendFrom = _.cloneDeep(_contents)
		var newObj = _.deepExtend(extendFrom, contents);
		if(!newObj.hasOwnProperty('mixins')) {
			newObj.mixins = [];
		}

		var found = _.find(newObj.mixins, function(mixin) {
			return mixin.trigger;
		})
		if(!found) {
			newObj.mixins.push({
				trigger: trigger,
				on: this.on
			});
		}

		if(isBaseClass) {
			return new WillowComponent(newObj);
		}
		var newComponent = new WillowComponent(
			newObj,
			_events
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

	this.peek = function() {
		if(!global.sinon) {
			throw 'Peek can only be used in debug mode. Set global.willow_debug = true';
		}
		return _contents;
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
		for(var i=0; i<handler.dependencies.length; i++) {
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

		function eventComplete(err, data) {
			eventObj.results = data;

			// Check if the event should bubble synchronously, if so pass to
			// parent, otherwise do nothing
			if(self.props.trigger) {
				if(self.props.events && self.props.events.hasOwnProperty(eventName)) {
					if(self.props.events[eventName].sync) {
						self.props.trigger(eventName, eventObj);
					}
				}
			}
		}

		// If there is no event handler then end right here
		if(!this.willow.events.handlers.hasOwnProperty(eventName)) {
			return eventComplete(null, {});
		}

		var asyncObj = {};
		this.willow.events.handlers[eventName].each(function(handler) {
			asyncObj[handler.get('name')] = eventRunner.call(this, handler, eventObj);
		});

		// Check if the event should bubble asynchronously, if so pass to
		// parent, otherwise do nothing
		async.auto(asyncObj, eventComplete);

		if(this.props.trigger) {
			if(this.props.events && this.props.events.hasOwnProperty(eventName)) {
				if(!this.props.events[eventName].sync) {
					this.props.trigger(eventName, eventObj);
				}
			}
		}
	}
}

module.exports = new WillowComponent({}, {}, true);