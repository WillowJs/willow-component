'use strict';

var React = require('react');
var _ = require('lodash');

var WillowMethods = {
	on: require('./libs/methods/on'),
	trigger: require('./libs/methods/trigger'),
	metadata: require('./libs/methods/metadata'),
	require: require('./libs/methods/require')
};

module.exports = {
	createClass: createClass
};

function createClass(obj) {

	obj = obj || {};

	// Fill in a render method
	if(!obj.render) {
		obj.render = function() {
			return <h1>No render method implemented</h1>;
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
			return <ChildClass {...this.props} iden="CHILD!!!" />;
		}
	});

	ParentClass.on = WillowMethods.on(ParentClass.prototype);
	ParentClass.require = WillowMethods.require(ParentClass.prototype);
	ParentClass.metadata = WillowMethods.metadata(ParentClass.prototype);

	ParentClass.prototype._willow = {
		events: {},
		requires: { client: {}, server: {}, both: {} }
	};

	return ParentClass;
}