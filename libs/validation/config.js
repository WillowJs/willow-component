'use strict';
var WillowError = require('willow-error');
var _ = require('lodash');
var validator = require('validator');
module.exports = function(key, value, context) {
	if(!key) {
		return new WillowError(
			'A key is required',
			400,
			'NOKEY'
		);
	}

	if(!_.isString(key)) {
		return new WillowError(
			'Keys must be strings',
			400,
			'BADKEY'
		);
	}

	if(!value) {
		return new WillowError(
			'A value is required',
			400,
			'NOVALUE'
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
};