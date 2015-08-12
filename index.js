'use strict';
var React = require('react');
var WillowState = require('./libs/state');

/*
 * Component Class
 *	- on
 * 	- setMetadata
 *	- getMetadata
 *	- require
 *	- run
 *	- toString
 *	- hasHandler
 *	- config
 * Component Parent Instance
 *	- trigger
 *	- getMetadata
 *	- setMetadata
  *	- hasHandler
 * Component Child Instance
 */

module.exports = {
	createClass: createClass
};

function createClass(_contents) {

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

			this.requires = instanceState.getRequires();
			this.config = instanceState.getConfig();
			this.trigger = trigger;
			this.metadata = instanceState.addMetadata;
			this.getMetadata = instanceState.getMetadata;
			this.hasHandler = instanceState.hasHandler;

			ChildClass.prototype.requires = instanceState.getRequires();
			ChildClass.prototype.config = this.config;
			ChildClass.prototype.trigger = trigger;
			ChildClass.prototype.metadata = instanceState.addMetadata;
			ChildClass.prototype.getMetadata = instanceState.getMetadata;
			ChildClass.prototype.hasHandler = instanceState.hasHandler;
		},
		render: function() {
			return React.createElement(ChildClass, this.props);
		}
	});

	var classState = new WillowState(_contents);

	ParentClass.on = classState.on;
	ParentClass.require = classState.addRequire;
	ParentClass.config = classState.addConfig;
	ParentClass.setConfig = classState.setConfig;
	ParentClass.metadata = classState.addMetadata;
	ParentClass.getMetadata = classState.getMetadata;
	ParentClass.run = function() {
		return classState.run.apply(classState, arguments);
	};
	ParentClass.toString = classState.toString;
	ParentClass.hasHandler = classState.hasHandler;
	ParentClass.getDir = function() {
		var path = require('path');
		return path.dirname(module.parent.filename);
	};

	ParentClass.prototype._willow = classState;

	return ParentClass;
}