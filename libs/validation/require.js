'use strict';
var WillowError = require('willow-error');
var _ = require('lodash');
var validator = require('validator');
module.exports = function(varName, modName, context) {
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
};