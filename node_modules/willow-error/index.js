module.exports = function(message, params, status, id) {
	this.message = message;
	this.params = params;
	this.status = status;
	this.id = id;

	this.send = function(res) {
		res.status(this.status).json(this);
	};
};