module.exports = {
    requestUrl: function(request, url) {
        return request(url, function(error, response, body) {if (!error && response.statusCode == 200){var rawData = JSON.parse(body);if(rawData.length == 0){return rawData;}}});
    },
    encryptStringWithRsaPublicKey: function(crypto, path, fs, toEncrypt, relativeOrAbsolutePathToPublicKey) {
        var absolutePath = path.resolve(relativeOrAbsolutePathToPublicKey);        
        var publicKey = fs.readFileSync(absolutePath, "utf8");
        var buffer = new Buffer(toEncrypt);
        var encrypted = crypto.publicEncrypt(publicKey, buffer);
        return encrypted.toString("base64");
    },
    decryptStringWithRsaPrivateKey: function(crypto, path, fs, toDecrypt, relativeOrAbsolutePathtoPrivateKey) {
        var absolutePath = path.resolve(relativeOrAbsolutePathtoPrivateKey);
        var privateKey = fs.readFileSync(absolutePath, "utf8");
        var buffer = new Buffer(toDecrypt, "base64");
        var decrypted = crypto.privateDecrypt(privateKey, buffer);
        return decrypted.toString("utf8");
    }
};