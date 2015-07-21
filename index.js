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

function loadRequires(requires) {
	var path = require('path');
	var filePath = '';
	for(var i in requires) {
		filePath = requires[i];
		if(filePath.charAt(0) === '.') {
			filePath = path.resolve(
				path.dirname(module.parent.filename),
				filePath
			);
		}
		this.requires[i] = require(filePath);
	}
}

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
				loadRequires.call(this, this._willow.requires.both);
				loadRequires.call(this, this._willow.requires.server);

				ChildClass.prototype.requires = this.requires;
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