'use strict';

var React = require('react');
var _ = require('lodash');

var WillowMethods = {
	on: require('./libs/methods/on'),
	trigger: require('./libs/methods/trigger'),
	metadata: require('./libs/methods/metadata'),
	require: require('./libs/methods/require'),
	run: require('./libs/methods/run'),
	toString: require('./libs/methods/toString')
};

module.exports = {
	createClass: createClass
};

function createClass(obj) {

	obj = obj || {};

	// Fill in a render method
	if(!obj.render) {
		obj.render = function() {
			return React.createElement('h1', {}, 'No render method implemented');
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

			var isNode = false;
			if (typeof process === 'object') {
				if (typeof process.versions === 'object') {
					if (process.versions.node !== 'undefined') {
						isNode = true;
					}
				}
			}

			if (isNode) {
				this.requires = {};
				for(var i in this._willow.requires.both) {
					this.requires[i] = require(this._willow.requires.both[i]);
				}
				for(var j in this._willow.requires.server) {
					this.requires[j] = require(this._willow.requires.server[j]);
				}
			}

			this.on = WillowMethods.on();
			this.trigger = WillowMethods.trigger();
			this.require = WillowMethods.require();
			this.metadata = WillowMethods.metadata();
			ChildClass.prototype.on = WillowMethods.on(this);
			ChildClass.prototype.trigger = WillowMethods.trigger(this);
			ChildClass.prototype.require = WillowMethods.require(this);
			ChildClass.prototype.metadata = WillowMethods.metadata(this);
		},
		render: function() {
			return React.createElement(ChildClass, this.props);
		}
	});

	ParentClass.on = WillowMethods.on(ParentClass.prototype);
	ParentClass.require = WillowMethods.require(ParentClass.prototype);
	ParentClass.metadata = WillowMethods.metadata(ParentClass.prototype);
	ParentClass.run = WillowMethods.run(ParentClass.prototype);
	ParentClass.toString = WillowMethods.toString(ParentClass.prototype);

	ParentClass.prototype._willow = {
		events: {},
		contents: obj,
		requires: { client: {}, server: {}, both: {} },
		metadata: function(){}
	};

	return ParentClass;
}