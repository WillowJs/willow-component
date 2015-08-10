'use strict';

var React = require('react');
var WillowState = require('./libs/state');
// var _ = require('lodash');

/*
 * Component Class
 *	- on
 * 	- setMetadata
 *	- getMetadata
 *	- require
 *	- run
 *	- toString
 *	- hasHandler
 * Component Parent Instance
 *	- trigger
 *	- getMetadata
 *	- setMetadata
  *	- hasHandler
 * Component Child Instance
 */

// var WillowMethods = {
// 	on: require('./libs/methods/on'),
// 	trigger: require('./libs/methods/trigger'),
// 	metadata: require('./libs/methods/metadata'),
// 	require: require('./libs/methods/require'),
// 	run: require('./libs/methods/run'),
// 	toString: require('./libs/methods/toString')
// };

module.exports = {
	createClass: createClass
};

// function loadRequires(requires) {
// 	var path = require('path');
// 	var filePath = '';
// 	for(var i in requires) {
// 		filePath = requires[i];
// 		if(filePath.charAt(0) === '.') {
// 			filePath = path.resolve(
// 				path.dirname(module.parent.filename),
// 				filePath
// 			);
// 		}
// 		this.requires[i] = require(filePath);
// 	}
// }

function createClass(_contents, _events, _requires, _metadata) {

	_contents = _contents || {};

	// Fill in a render method
	if(!_contents.render) {
		_contents.render = function() {
			return React.createElement('h1', {}, 'No render method implemented');
		};
	}

	// Build out the child component
	var ChildClass = React.createClass(_contents);

	var ParentClass = React.createClass({
		componentWillMount: function() {
			// ... code goes here
			var prototypeState = Object.getPrototypeOf ? Object.getPrototypeOf(this)._willow : this.__proto__._willow;
			var instanceState = prototypeState.clone();

			function trigger(eventName) {
				var self = this;
				return function(eventObj) {
					return instanceState.trigger(self, eventName, eventObj);
				};
			}

			var isNode = false;
			if (typeof process === 'object') {
				isNode = !process.browser;
			}

			if (isNode) {
				// this.requires = {};
				// loadRequires.call(instanceState, instanceState.getRequires('both'));
				// loadRequires.call(instanceState, instanceState.getRequires('server'));

				// ChildClass.requires = this.requires;
				instanceState.loadServerRequires();
				// ChildClass.prototype.requires = instanceState.getRequires();
			}
			// else {
			// 	ChildClass.prototype.requires = this.requires;
			// }

			this.requires = instanceState.getLoadedRequires();
			this.trigger = trigger;
			this.setMetadata = instanceState.setMetadata;
			this.getMetadata = instanceState.getMetadata;
			this.hasHandler = instanceState.hasHandler;

			ChildClass.prototype.requires = instanceState.getRequires();
			ChildClass.prototype.trigger = trigger;
			ChildClass.prototype.setMetadata = instanceState.setMetadata;
			ChildClass.prototype.getMetadata = instanceState.getMetadata;
			ChildClass.prototype.hasHandler = instanceState.hasHandler;

			// this.on = WillowMethods.on();
			// this.trigger = WillowMethods.trigger();
			// this.require = WillowMethods.require();
			// this.metadata = WillowMethods.metadata();
			// ChildClass.prototype._willow = this._willow;
			// ChildClass.prototype.on = WillowMethods.on(this);
			// ChildClass.prototype.trigger = WillowMethods.trigger();
			// ChildClass.prototype.require = WillowMethods.require(this);
			// ChildClass.prototype.metadata = WillowMethods.metadata(this);
		},
		render: function() {
			// var props = _.cloneDeep(this.props);
			// props.name = 'Child';
			return React.createElement(ChildClass, this.props);
		}
	});

	var classState = new WillowState(_contents, _events, _requires, _metadata);

	ParentClass.on = classState.on;
	ParentClass.require = classState.require;
	ParentClass.getMetadata = classState.getMetadata;
	ParentClass.setMetadata = classState.setMetadata;
	ParentClass.run = classState.run;
	ParentClass.toString = classState.toString;
	ParentClass.hasHandler = classState.hasHandler;

	ParentClass.prototype._willow = classState;

	// ParentClass.prototype._willow = {
	// 	events: {},
	// 	contents: obj,
	// 	requires: { client: {}, server: {}, both: {} },
	// 	metadata: function(){}
	// };

	return ParentClass;
}