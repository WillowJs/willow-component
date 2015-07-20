'use strict';
var validateRequire = require('../validation/require');
module.exports = function(self) {
	return function(varName, modName, context) {
		// @todo what happens when the component I'm extending from shares a varName
		context = context.toLowerCase();
		var error = validateRequire(varName, modName, context);
		if(error) {
			throw error;
		}

		self._willow.requires[context][varName] = modName;

		return this;

	};
};