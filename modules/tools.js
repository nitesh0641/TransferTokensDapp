module.exports = {
	tName: function (token) {
		return token.name.call();
	},
	tBalance: function(token, addr) {
		return (token.balanceOf.call(addr)/1000000000000000000)toFixed(18);
		// return token.balanceOf.call(addr).toString(10);
	},
	cAddress: function(contract) {
		return contract.getContractAddr.call();
	},
	cTransfer: function(contract, mainAddr, fromAddress, toAddress, units, gasLimit, gasPrice) {
		return contract.transfer.sendTransaction(fromAddress,toAddress,units,{from:mainAddr,gas:gasLimit,gasPrice:gasPrice});
		// return contract.transfer(fromAddress, toAddress, units);
	},
	retryTransfer: function(contract, mainAddr, fromAddress, toAddress, units, nonce, gasLimit, gasPrice) {
		return contractInstance.transfer.sendTransaction(fromAddress,toAddress,units,{from:mainAddr,nonce:nonce,gas:gasLimit,gasPrice:gasPrice})
	},
	tokenTransferEstimate: function(web3, contract, mainAddr, fromAddress, toAddress, units, gasLimit, gasPrice) {
		var data0 = contract.transfer.getData(fromAddress, toAddress, units,{from:mainAddr,gas:gasLimit,gasPrice:gasPrice});
		return web3.eth.estimateGas({data: data0, from: fromAddress, to: toAddress});
		// return contract.transfer.estimateGas(fromAddress,toAddress,units,{from:mainAddr,gas:gasLimit,gasPrice:gasPrice});
	}
};

