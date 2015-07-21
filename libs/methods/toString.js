'use strict';
var _ = require('lodash');

module.exports = function(self) {
	return function(localOnly) {
		// Recurse function
		function recurse(target) {
			if(_.isFunction(target)) {
				return target.toString();
			}
			else if(_.isArray(target)) {
				var pieces = [];
				for(var i=0; i < target.length; i++) {
					pieces.push(recurse(target[i]));
				}
				return '['+pieces.join(',')+']';
			}
			else if(_.isObject(target)) {
				var result = '{';
				for(var j in target) {
					result += '\''+j+'\':' + recurse(target[j])+',';
				}
				result = result.substring(0, result.length-1) + '}';
				return result;
			}
			else if(_.isString(target)) {
				return '"'+target.toString()+'"';
			}
			else {
				return target.toString();
			}
		}

		var results = '{';

		// Contents
		results += 'contents: ' + recurse(self._willow.contents);

		// Events
		results += ', events: ';
		var eventPieces = [];
		for(var i in self._willow.events) {
			var handlerPieces = [];
			for(var j in self._willow.events[i]) {
				if(!localOnly || (localOnly && self._willow.events[i][j].method.toLowerCase() === 'local')) {
					handlerPieces.push('\''+j+'\': ' + recurse(self._willow.events[i][j]));
				}
			}
			eventPieces.push('\''+i+'\': {'+handlerPieces.join(',') + '}');
		}

		results += '{' + eventPieces.join(',') + '}, metadata: ';
		results += self._willow.metadata ? self._willow.metadata.toString() : 'undefined';
		results += ', requires: ' + JSON.stringify(self._willow.requires) + '}';

		return results;
	};
};