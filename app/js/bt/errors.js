// Behavior Tree Error Management

function Pending(message) {
	this.name = 'Pending';
	this.message = message || this.name;		
}


Pending.prototype = new Error();
Pending.prototype.constructor = Pending;  


function Failed(message) {
	this.name = 'Failed';
	this.message = message || this.name;	
}


Failed.prototype = new Error;
Failed.prototype.constructor = Failed;  


var exports 	= module.exports;
exports.Pending = Pending;
exports.Failed 	= Failed;

