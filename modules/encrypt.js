module.exports = {
    encryptStringWithRsaPublicKey: function(crypto, path, fs, toEncrypt, relativeOrAbsolutePathToPublicKey) {
        var absolutePath = path.resolve(relativeOrAbsolutePathToPublicKey);        
        var publicKey = fs.readFileSync(absolutePath, "utf8");
        var buffer = new Buffer(toEncrypt);
        var encrypted = crypto.publicEncrypt(publicKey, buffer);
        console.log("encrypted =>"+encrypted);
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