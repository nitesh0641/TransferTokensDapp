module.exports = {
	uploadFile: function(swarm, filepath, kind, defaultFile) {
		return swarm.upload({path: filepath, kind: kind, defaultFile: defaultFile});
	  	// .then(return())
	  	// .catch(console.log);
	}
};