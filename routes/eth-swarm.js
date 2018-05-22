var express = require('express');
var router = express.Router();
var Web3 = require('web3');
var crypto = require('crypto');
var path = require('path');
var fs = require('fs');
var fstream = require('fstream');
const { exec } = require('child_process');
var mkdirp = require('mkdirp');

var admin = require('../modules/admin');
var tokens = require('../modules/tools');
const swarm = require("swarm-js").at("http://127.0.0.1:8500");
var encrypt = require('../modules/encrypt');

var web3Message = '';

router.post("/uploadFile", function(req, res, next) {
	var filename = req.body.filename;
	var filepath = req.body.filepath;
	var user = req.body.username;
	var pubkey = '/var/crypto/'+user+'/pubkey.pem';
	var protected = '/var/www/TransferTokensDapp/uploads/protected/';

	// var IV = new Buffer(crypto.randomBytes(16));
	var IV = new Buffer("nc$1238*6089alch");
	var read = fstream.Reader(filepath),
		ency = crypto.createCipheriv('aes-256-ctr', pubkey, IV),
		writer = fstream.Writer(protected+filename+".enc");
	read.pipe(ency).pipe(writer);
	
	swarm.upload(protected+filename+".enc")
	  .then(function(hash){
	  	web3Message = {"hash":hash,"pass":IV.toString('hex')}
	  	res.json({"success": web3Message});
	  })
	  .catch(console.log);

	// res.json({"hash": web3Message});
});

router.post("/downloadData", function(req, res, next) {

	const fileHash = req.body.hash;
	var prikey = '/var/crypto/key.pem';

	var read = fstream.Reader('./image.png.enc'),
		dency = crypto.createDecipheriv('aes-256-ctr', pubkeyUser1),
		writer = fstream.Writer('./image.png');
	read.pipe(dency).pipe(writer);

	swarm.download(fileHash)
	.then(function(array){
		array = swarm.toString(array);
		// decryptedFile = encrypt.decryptStringWithRsaPrivateKey(crypto, path, fs, array, prikey);
	  	res.json({"hash": array});
	  })
	.catch(console.log);

	// res.json({"data": web3Message});
});

router.post("/generateCrypto", function(req, res, next){
	var user = req.body.username;
	var dirpath = "/var/crypto/"+user;
	var filepath = "/var/crypto/"+user+"/pubkey.pem";

	// -- create directory--
	mkdirp(dirpath, function(err) {
		if(!err){
			var prime_length = 256;
			var diffHell = crypto.createDiffieHellman(prime_length);

			diffHell.generateKeys('hex');
			var key = diffHell.getPublicKey('hex');

			fs.writeFile(filepath, key, function(err) {
			    if(err) {
			        console.log(err);
			    }
			    else{
			    	web3Message = "Crypto generated!!"
			    	res.json({"message": web3Message});
			    }
			});
		}
	});
	// res.json({"message": web3Message});
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

// -- encryption using ursa
// router.post("/uploadFile", function(req, res, next) {
// 	var filepath = req.body.filepath;
	
// 	// user1 has his private and user2's public key
// 	var privkeyUser1 = ursa.createPrivateKey(fs.readFileSync('/var/crypto/user1/privkey.pem'));
// 	var pubkeyUser2 = ursa.createPublicKey(fs.readFileSync('/var/crypto/user2/pubkey.pem'));

// 	console.log('Encrypt with User2 Public; Sign with User1 Private');

// 	fs.readFile(filepath, 'utf8', function(err, contents) {
// 		var buffer = new Buffer(contents);
// 		enc = pubkeyUser2.encrypt(buffer, 'utf8', 'base64');
// 		sig = privkeyUser1.hashAndSign('sha256', buffer, 'utf8', 'base64');
// 		console.log('encrypted', enc, '\n');
// 		console.log('signed', sig, '\n');		
// 	    var stream = fs.createWriteStream('/var/www/TransferTokensDapp/uploads/encrypted.png');
// 		stream.once('open', function(fd) {
// 		  stream.write(encryptedFile);
// 		  stream.end();
// 		});
// 	});
	
// 	swarm.upload('/var/www/TransferTokensDapp/uploads/encrypted.png')
// 	  .then(function(hash){
// 	  	web3Message = hash;
// 	  	res.json({"hash": web3Message});
// 	  })
// 	  .catch(console.log);
	
// 	// swarm.upload({
// 	//   path: encryptedFile,		// path to data / file / directory
// 	//   kind: "file",			// could also be "file" or "data" or "directory"
// 	//   defaultFile: ""}) 	// (defaultFile: "/index.html") optional, and only for kind === "directory"
// 	//   .then(function(hash){
// 	//   	web3Message = hash;
// 	//   	res.json({"hash": web3Message});
// 	//   })
// 	//   .catch(console.log);

// 	// res.json({"hash": web3Message});
// });


module.exports = router;