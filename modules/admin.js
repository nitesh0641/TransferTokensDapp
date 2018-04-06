module.exports = {
	accountOpen: function(web3, password) {
		return web3.personal.newAccount(password);
	},
	transfer: function(web3, from, to, unit, gasLimit, gasPrice) {
		return web3.eth.sendTransaction({from:from, to:to, value: web3.toWei(unit, "ether"), gas:gasLimit, gasPrice:gasPrice});
	},
	balance: function(web3, addr){
		return web3.fromWei(web3.eth.getBalance(addr), "ether");
	},
	tBalance: function(token, addr) {
		return token.balanceOf.call(addr).toString(10);
	},
	tApproveAcc: function(token, mainAddr, spender, units, gasLimit, gasPrice) {
		return token.approve.sendTransaction(spender,units,{from:mainAddr,gas:gasLimit,gasPrice:gasPrice});
	}
};
