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
var request = require('request');

// import local modules..
var admin = require('../modules/admin');
var tokens = require('../modules/tools');
const swarm = require("swarm-js").at("http://127.0.0.1:8500");
var encrypt = require('../modules/encrypt');

var web3Message = '';
// var zip = new Zip();

// -- upload/download files without encryption/decryption --
router.post("/upload", function(req, res, next) {
	var filename = req.body.filename;
	var filepath = req.body.filepath;
	var user = req.body.username;

	// zip.file('test.file', 'hello there');
	// var data = zip.generate({base64:false,compression:'DEFLATE'});
	// console.log(data); // ugly data

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

// =========================================================X======================X============================================

// -- upload/download files with encryption/decryption --
router.post("/uploadFile", function(req, res, next) {
	var filename = req.body.filename;
	var filepath = req.body.filepath;
	var user = req.body.username;
	var pubkey = '/var/crypto/'+user+'/pubkey.pem';
	var protected = '/var/www/TransferTokensDapp/uploads/protected/';
	var timeStamp = Math.floor(Date.now() / 1000);
	var encFile = protected+timeStamp+"_"+filename+".enc";

	// var forIV = "nc$"+crypto.randomBytes(15);
	var forIV = "nc$"+randomstring.generate(13);
	var IV = new Buffer(forIV);
	// var IV = new Buffer("nc$1238*6089alch");

	fs.readFile(pubkey, 'utf8', function(err, contents) {
		// Read file to upload --
		fs.readFile(filepath, 'binary', function(err, fileRaw) {
			try{
				fileBuff = new Buffer(fileRaw),
				fileData = fileBuff.toString('base64');
				var	ency = crypto.createCipheriv('aes-256-cbc', contents.substring(0,32), IV);
				var encryptdata = ency.update(fileData, 'utf8', 'hex');
				encryptdata += ency.final('hex');
				fs.writeFile(encFile, encryptdata, 'binary', function (err) {
					if (!err){
						setTimeout(function() {
						    swarm.upload({path: encFile, kind: "file"})
							.then(function(hash){
								res.json({
									"status":"200 OK",
									"hash":hash,
									"pass":IV.toString("hex")
								});
							})
							.catch(console.log);
						}, 500);
					}
				});
			}
			catch(err){
				res.status(500).json({
					"status":"500 Internal Server Error",
					"hash":"",
					"pass":""
				});
			}
			
		});
	});
});

router.post("/downloadData", function(req, res, next) {
	var fileHash = req.body.hash;
	var user = req.body.username;
	var pass = req.body.password;
	var type = req.body.type;
	var pubkey = '/var/crypto/'+user+'/pubkey.pem';
	var downloadpath = '/var/www/block.com/assets';
	var timeStamp = Math.floor(Date.now() / 1000);
	var filename = user+"_"+timeStamp+"."+type;
	var downloadFile = downloadpath+"/"+filename;
	var downloadFileUrl = 'http://192.168.1.67:8081/assets/'+filename;
	var curlCommand = 'curl http://localhost:8080/bzz:/'+fileHash+'/ --output '+downloadFile;

	exec(curlCommand, function (error, stdout, stderr){
		if (error == null) {
			var IV = new Buffer(req.body.password, 'hex');
			var cipher_blob = IV.toString().split("$");
			if(cipher_blob[0] == 'nc'){
				// Read file to download --
				fs.readFile(downloadFile, 'binary', function(err, contents) {
					// fs.writeFile(downloadpath+"/down_nitesh_"+timeStamp+".enc", contents, function (err) {
					// 	console.log(err);
					// });
					if(err){
						res.json({
							"status":"204 No Content",
							"filepath":"",
							"message": "There was some problem. Please try again later."
						});
					}

					fs.readFile(pubkey, 'utf8', function(err, key) {
						try{
							var	dency = crypto.createDecipheriv('aes-256-cbc', key.substring(0,32), IV);						
							var	decoded = dency.update(contents, 'hex', 'utf8');
							decoded += dency.final('utf8');
							var filedata = new Buffer(decoded, 'base64');
							filedata = filedata.toString('utf8');
							// var	writer = fstream.Writer(downloadFile);
							fs.writeFile(downloadFile, filedata, 'binary', function (err) {
								res.json({
									"status":"200 OK",
									"filepath": downloadFileUrl,
									"message":"success"
								});
							});
						}
						catch(err){
							res.json({
								"status":"204 No Content",
								"filepath":"",
								"message": "There was some problem. Please try again later."
							});
						}
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
		}
	});
});

router.post("/removeOld", function(req, res, next) {
	var filepath = req.body.filepath;
	fs.unlink(filepath, function (err) {
	    if (err){
	    	res.json({
	    		"status":"500 Internal Server Error",
	    		"message": err
	    	});
	    }
	    else{
	    	res.json({
	    		"status":"200 OK",
	    		"message": "File Deteled."
	    	});
	    }
	});
});

router.post("/isAvailable", function(req, res, next) {
	var filehash = req.body.filehash;
	console.log("filehash => "+filehash);
	var url = 'http://localhost:8500/bzz-list:/'+filehash+'/';
	
	try{
		request(url, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				var rawData = JSON.parse(body);
				if(rawData.length != 0){
					res.json({
						"status":"200",
						"hash": filehash,
						"message": "File Exists."
					});
				}
			}
			else{
				res.json({
					"status":"204",
					"hash": filehash,
					"message": "File Doesn't Exists."
				});
			}
		});
	}
	catch(err){
		res.status(500).json({
			"status":"500",
			"hash": filehash,
			"message": "Try again later."
		});
	}
});

router.post("/isAvailable/batch", function(req, res, next) {
	var filehash = req.body.filehash;
	console.log("filehash => "+filehash.split(','));

	res.json({
		"status":"204",
		"message": "File Doesn't Exists."
	});
	// var url = 'http://localhost:8500/bzz-list:/'+filehash+'/';
	
	// try{
	// 	request(url, function(error, response, body) {
	// 		if (!error && response.statusCode == 200) {
	// 			var rawData = JSON.parse(body);
	// 			if(rawData.length != 0){
	// 				res.json({
	// 					"status":"200",
	// 					"hash": filehash,
	// 					"message": "File Exists."
	// 				});
	// 			}
	// 		}
	// 		else{
	// 			res.json({
	// 				"status":"204",
	// 				"hash": filehash,
	// 				"message": "File Doesn't Exists."
	// 			});
	// 		}
	// 	});
	// }
	// catch(err){
	// 	res.status(500).json({
	// 		"status":"500",
	// 		"hash": filehash,
	// 		"message": "Try again later."
	// 	});
	// }
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