'use strict';
var _ = require('lodash');
module.exports = function(self) {
	return function(fnOrObj) {
		if(_.isFunction(fnOrObj)) {
			self._willow.metadata = fnOrObj;
			return this;
		}
		else {
			return self._willow.metadata(fnOrObj);
		}
	};
};