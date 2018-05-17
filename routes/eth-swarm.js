var express = require('express');
var router = express.Router();
var Web3 = require('web3');
var crypto = require('crypto');
var path = require('path');
var fs = require('fs');
var admin = require('../modules/admin');
var tokens = require('../modules/tools');
const swarm = require("swarm-js").at("http://127.0.0.1:8500");
var encrypt = require('../modules/encrypt');

var web3Message = '';

router.post("/uploadFile", function(req, res, next) {
	var filepath = req.body.filepath;
	var pubkey = '/var/crypto/server.crt';

	fs.readFile(filepath, 'utf8', function(err, contents) {
		encryptedFile = encrypt.encryptStringWithRsaPublicKey(crypto, path, fs, contents, pubkey);
	    var stream = fs.createWriteStream('/var/www/TransferTokensDapp/uploads/encrypted.png');
		stream.once('open', function(fd) {
		  stream.write(encryptedFile);
		  stream.end();
		});
	    // fs.writefile(,buffer,'utf8');
	});
	
	swarm.upload('/var/www/TransferTokensDapp/uploads/encrypted.png')
	  .then(function(hash){
	  	web3Message = hash;
	  	res.json({"hash": web3Message});
	  })
	  .catch(console.log);
	// swarm.upload({
	//   path: encryptedFile,		// path to data / file / directory
	//   kind: "file",			// could also be "file" or "data" or "directory"
	//   defaultFile: ""}) 	// (defaultFile: "/index.html") optional, and only for kind === "directory"
	//   .then(function(hash){
	//   	web3Message = hash;
	//   	res.json({"hash": web3Message});
	//   })
	//   .catch(console.log);

	// res.json({"hash": web3Message});
});

router.post("/downloadFile", function(req, res, next){
	var filehash = req.body.filehash;
	targetDir = "/var/www/TransferTokensDapp/downloads";

	swarm.download("1b14503abd07770da8adb680a18507738390117499cce3114b5a4bc60f5fd9dd", "/var/www/TransferTokensDapp/downloads")
	.then(function(path){
	  	res.json({"filepath": path});
		console.log(`Downloaded DApp to ${path}.`)
	})
	.catch(console.log);
});

router.post("/downloadData", function(req, res, next) {

	const fileHash = req.body.hash;
	var prikey = '/var/crypto/key.pem';

	swarm.download(fileHash)
	.then(function(array){
		array = swarm.toString(array);
		decryptedFile = encrypt.decryptStringWithRsaPrivateKey(crypto, path, fs, array, prikey);
	  	res.json({"hash": decryptedFile});
	  })
	.catch(console.log);

	// res.json({"data": web3Message});
});


module.exports = router;