module.exports = {
	uploadFile: function(swarm, filepath, kind, defaultFile, web3Message) {
		swarm.upload({path: filepath, kind: kind, defaultFile: defaultFile}).then(hash => {web3Message = hash;});
		return web3Message;
	  	// .catch(error => {return error;});
	}
};