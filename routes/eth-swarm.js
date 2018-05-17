var express = require('express');
var router = express.Router();
var Web3 = require('web3');
var admin = require('../modules/admin');
var tokens = require('../modules/tools');
const swarm = require("swarm-js").at("http://127.0.0.1:8500");

var web3Message = '';

router.post("/uploadFile", function(req, res, next) {
	var filepath = req.body.filepath;

	swarm.upload({
	  path: filepath,		// path to data / file / directory
	  kind: "file",			// could also be "file" or "data" or "directory"
	  defaultFile: ""}) 	// (defaultFile: "/index.html") optional, and only for kind === "directory"
	  .then(hash => web3Message=hash)
	  .catch(console.log);

	res.json({"hash": web3Message});
});

router.post("/uploadJSONData", function(req, res, next) {

	swarm.upload(req.body.data).then(hash => {
	  web3Message = hash;
	});

	res.json({"hash": web3Message});
});

router.post("/downloadJSONData", function(req, res, next) {

	const fileHash = req.body.hash;
	swarm.download(fileHash).then(array => {
	  web3Message = swarm.toString(array);
	});

	res.json({"data": web3Message});
});


module.exports = router;