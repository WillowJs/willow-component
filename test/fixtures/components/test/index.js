'use strict';
var Willow = require('../../../../index.js');

module.exports = Willow.createClass({
	render: function() {
		return (<h1>test</h1>);
	},
	test: function(foo) {
		console.log('bar');
	}
});