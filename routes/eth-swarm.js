var express = require('express');
var router = express.Router();
var Web3 = require('web3');
var crypto = require('crypto');
var path = require('path');
var fs = require('fs');
var fstream = require('fstream');
const { exec } = require('child_process');
var mkdirp = require('mkdirp');
var randomstring = require("randomstring");
var http = require('http');

var admin = require('../modules/admin');
var tokens = require('../modules/tools');
const swarm = require("swarm-js").at("http://127.0.0.1:8500");
var encrypt = require('../modules/encrypt');

var web3Message = '';

router.post("/upload", function(req, res, next) {
	var filename = req.body.filename;
	var filepath = req.body.filepath;
	var user = req.body.username;

	swarm.upload({path: filepath, kind: "file"})
	.then(function(hash){
		res.json({"hash": hash});
	})
	.catch(console.log);

});

router.post("/download", function(req, res, next) {
	var fileHash = req.body.hash;
	var user = req.body.username;
	var pass = req.body.password;
	var type = req.body.type;
	var downloadpath = '/var/www/TransferTokensDapp/downloads';
	var downloadFile = downloadpath+"/"+user+"."+type;
	var curlCommand = 'curl http://localhost:8080/bzz:/'+fileHash+'/ --output '+downloadFile;

	exec(curlCommand, function (error, stdout, stderr){
		if (error == null) {
			res.json({"Success": "File Downloaded."});
		}
		else{
			res.json({"Failure": "Problem in File Download."});
		}
	});

});

router.post("/uploadFile", function(req, res, next) {
	var filename = req.body.filename;
	var filepath = req.body.filepath;
	var user = req.body.username;
	var pubkey = '/var/crypto/'+user+'/pubkey.pem';
	var protected = '/var/www/TransferTokensDapp/uploads/protected/';
	var timeStamp = Math.floor(Date.now() / 1000);
	var encFile = protected+filename+"_"+timeStamp+".enc";

	// var forIV = "nc$"+crypto.randomBytes(15);
	var forIV = "nc$"+randomstring.generate(13);
	var IV = new Buffer(forIV);
	// var IV = new Buffer("nc$1238*6089alch");

	fs.readFile(pubkey, 'utf-8', function(err, contents) {
		// var read = fstream.Reader(filepath);
		fs.readFile(filepath, 'utf-8', function(err, fileData) {
			var	ency = crypto.createCipheriv('aes-256-cbc', contents.substring(0,32), IV);
			var encryptdata = ency.update(fileData, 'utf-8', 'hex');
			encryptdata += ency.final('hex');
			// var	ency = crypto.createCipher('aes-128-ccm', pubkey, IV);
			// var	writer = fstream.Writer(protected+filename+".enc");
			// read.pipe(ency).pipe(writer);
			fs.writeFile(encFile, encryptdata, function (err) {
				if (!err){
					setTimeout(function() {
					    swarm.upload({path: encFile, kind: "file"})
						.then(function(hash){
							web3Message = {"hash":hash,"pass":IV.toString("hex")}
							res.json({"hash": web3Message});
						})
						.catch(console.log);
					}, 500);
				}
			});
		});
	});
	
	// res.json({"hash": web3Message});
});

router.post("/downloadData", function(req, res, next) {
	var fileHash = req.body.hash;
	var user = req.body.username;
	var pass = req.body.password;
	var type = req.body.type;
	var pubkey = '/var/crypto/'+user+'/pubkey.pem';
	var downloadpath = '/var/www/TransferTokensDapp/downloads';
	var timeStamp = Math.floor(Date.now() / 1000);
	var downloadFile = downloadpath+"/"+user+"_"+timeStamp+"."+type;
	var curlCommand = 'curl http://localhost:8080/bzz:/'+fileHash+'/ --output '+downloadFile;

	exec(curlCommand, function (error, stdout, stderr){
		if (error == null) {
			var IV = new Buffer(req.body.password, 'hex');
			var cipher_blob = IV.toString().split("$");
			if(cipher_blob[0] == 'nc'){
				fs.readFile(downloadFile, 'utf-8', function(err, contents) {
					fs.readFile(pubkey, 'utf-8', function(err, key) {
						var	dency = crypto.createDecipheriv('aes-256-cbc', key.substring(0,32), IV),
							decoded = dency.update(contents, 'hex', 'utf-8');
							decoded += dency.final('utf-8');
						// var	writer = fstream.Writer(downloadFile);
						fs.writeFile(downloadFile, decoded, function (err) {
							res.json({"success": downloadFile});
						});
					});			
				});
			}
			else{
				res.status(500).json({"failure": "There was some problem. Please try again later."});
			}
		}
		else{
			res.status(500).json({"failure": "There was some problem. Please try again later."});
		}
	});

	// // var file = fs.createWriteStream(downloadFile);
	// var request = http.get("http://localhost:8500/bzz:/"+fileHash, function(response) {
	// 	// response.pipe(file);
	// 	var fileData = new Buffer(response.toString());
	// 	var IV = new Buffer(req.body.password, 'hex');
	// 	var cipher_blob = IV.toString().split("$");
	// 	if(cipher_blob[0] == 'nc'){
	// 		fs.readFile(pubkey, 'utf8', function(err, contents) {
	// 			// var read = fstream.Reader(downloadFile);
	// 			var	dency = crypto.createDecipheriv('aes-256-cbc', contents.substring(0,32), IV),
	// 				decoded = dency.update(fileData, 'binary', 'utf8');
	// 				decoded += dency.final('utf8');
	// 			// var	dency = crypto.createDecipher('aes-128-ccm', pubkey, IV);
	// 			var	writer = fstream.Writer(downloadFile);
	// 			decoded.pipe(writer);
	// 			res.json({"success": downloadFile});
	// 			// res.json({"success": downloadData});
	// 		});			
	// 	}
	// 	else{
	// 		res.status(500).json({"failure": "There was some problem. Please try again later."});
	// 	}
	// });

	// swarm.download(fileHash, downloadpath)
	// .then(function(downloadData){
	// 	// downloadData = swarm.toString(downloadData);
	// 	var IV = new Buffer(req.body.password, 'hex');
	// 	var cipher_blob = IV.toString().split("$");
	// 	if(cipher_blob[0] == 'nc'){
	// 		// var read = fstream.Reader(downloadData);
	// 		// var	dency = crypto.createDecipheriv('aes-256-ctr', pubkey, IV);
	// 		// // var	dency = crypto.createDecipher('aes-128-ccm', pubkey, IV);
	// 		// var	writer = fstream.Writer(downloadpath+user+type);
	// 		// read.pipe(dency).pipe(writer);
	// 		// res.json({"success": downloadpath+user+type});
	// 		res.json({"success": downloadData});
	// 	}
	// 	else{
	// 		res.status(500).json({"failure": "There was some problem. Please try again later."});
	// 	}
	//   })
	// .catch(console.log);

	// res.json({"data": web3Message});
});

router.post("/generateCrypto", function(req, res, next){
	var user = req.body.username;
	var dirpath = "/var/crypto/"+user;
	var filepath = "/var/crypto/"+user+"/pubkey.pem";

	// -- create directory--
	mkdirp(dirpath, function(err) {
		if(!err){
			const exec = require('child_process').exec;
			exec('openssl enc -aes-256-cbc -k secret -P -md sha1',
			        (error, stdout, stderr) => {
			        	output = stdout.split("\n");
			        	key = output[1].split("=");
			        	
			        	fs.writeFile(filepath, key[1], function(err) {
						    if(err) {
						        console.log(err);
						    }
						    else{
						    	web3Message = "Crypto generated!!"
						    	res.json({"message": web3Message});
						    }
						});
			        });
			// var prime_length = 256;
			// var diffHell = crypto.createDiffieHellman(prime_length);

			// diffHell.generateKeys('hex');
			// var key = diffHell.getPublicKey('hex');
		}
	});
	// res.json({"message": web3Message});
});

router.post("/downloadFile", function(req, res, next){
	var filehash = req.body.filehash;
	var targetDir = "/var/www/TransferTokensDapp/downloads/nitesh.png";

	swarm.download(filehash, targetDir)
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