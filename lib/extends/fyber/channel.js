(function(){

	module.exports = FyberChannel;

	var YieldValue = require('../../yieldValue');

	function FyberChannel(){
	    this._sends = [];
	    this._gets = [];
	}

	FyberChannel.prototype._sends = null;
	FyberChannel.prototype._gets = null;

	function sendIt(channel){
	    if (!channel._sends.length || !channel._gets.length) return;

	    var data = channel._sends.shift(),
	        gets = channel._gets
	    ;

	    channel._gets = [];

	    gets.forEach(function(value){
	        value.__result = data;
	        value.__done();
	    });
	}

	/**
	 * Sends data to channel
	 * @param {*} data Data to send
	 */
	FyberChannel.prototype.send = function(data){
	    this._sends.push(data);

	    sendIt(this);
	};

	/**
	 * Gets data from channel
	 * @return {YieldValue}
	 */
	FyberChannel.prototype.get = function(){
	    var value = new YieldValue();

	    this._gets.push(value);

	    sendIt(this);

	    return value;
	};

})();
