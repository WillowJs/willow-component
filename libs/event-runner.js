'use strict';
var _ = require('./lodash/lodash.custom');

// This function returns an array that can be passed into async.auto
module.exports = function(handler, eventObj) {
	var returnArray = [];
	var self = this;
	var dependencies = handler.dependencies || [];

	// Copy all of the dependencies
	for(var i=0; i < dependencies.length; i++) {
		returnArray.push(dependencies[i]);
	}

	// Add the function to run
	returnArray.push(function(cb, results) {
		var eventObjCopy = _.cloneDeep(eventObj);
		_.assign(eventObjCopy.results, results);
		handler.run.call(
			self,
			eventObjCopy,
			function(data) {	// resolve
				cb(null, data);
			},
			function(err) {	// reject
				cb(err);
			}
		);
	});

	return returnArray;

};