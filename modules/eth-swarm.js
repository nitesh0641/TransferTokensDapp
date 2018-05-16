module.exports = {
	uploadFile: function(swarm, filepath, kind, defaultFile) {
		swarm.upload({path: filepath, kind: kind, defaultFile: defaultFile}).then(hash => {return hash;})
	  	// .catch(error => {return error;});
	}
};