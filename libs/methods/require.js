'use strict';
var validateRequire = require('../validation/require');
module.exports = function(self) {
	return function(varName, modName, context) {
		context = context.toLowerCase();
		var error = validateRequire(varName, modName, context);
		if(error) {
			throw error;
		}

		self._willow.requires[context][varName] = modName;

		return this;

	};
};