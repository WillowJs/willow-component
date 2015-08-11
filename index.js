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

var isNode = false;
if (typeof process === 'object') {
	isNode = !process.browser;
}

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

			if(isNode) {
				var config = instanceState.getConfig();
				this.config = {};
				for(var i in config.both) {
					this.config[i] = config.both[i];
				}
				for(var j in config.server) {
					this.config[j] = config.server[j];
				}
				instanceState.loadServerRequires();
			}

			this.requires = instanceState.getLoadedRequires();
			this.trigger = trigger;
			this.setMetadata = instanceState.setMetadata;
			this.getMetadata = instanceState.getMetadata;
			this.hasHandler = instanceState.hasHandler;

			ChildClass.prototype.requires = instanceState.getLoadedRequires();
			ChildClass.prototype.config = this.config;
			ChildClass.prototype.trigger = trigger;
			ChildClass.prototype.setMetadata = instanceState.setMetadata;
			ChildClass.prototype.getMetadata = instanceState.getMetadata;
			ChildClass.prototype.hasHandler = instanceState.hasHandler;
		},
		render: function() {
			return React.createElement(ChildClass, this.props);
		}
	});

	var classState = new WillowState(_contents);

	ParentClass.on = classState.on;
	ParentClass.require = classState.require;
	ParentClass.setConfig = classState.setConfig;
	ParentClass.getMetadata = classState.getMetadata;
	ParentClass.setMetadata = classState.setMetadata;
	ParentClass.run = classState.run;
	ParentClass.toString = classState.toString;
	ParentClass.hasHandler = classState.hasHandler;

	ParentClass.prototype._willow = classState;

	return ParentClass;
}