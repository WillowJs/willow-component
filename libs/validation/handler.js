var validator = require('validator');
var _ = require('../lodash/lodash.custom');
module.exports = function(handler) {
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
	for(var i = 0; i < handler.dependencies.length; i++) {
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
};