require('dotenv').config()
const Web3 = require('web3');
const InputDataDecoder = require('ethereum-input-data-decoder');
const contractABI = require('./blurPoolAbi.json');

const contractAddress = '0x0000000000A39bb272e79075ade125fd351887Ac'; // https://etherscan.io/address/0x0000000000a39bb272e79075ade125fd351887ac#readProxyContract

const provider = new Web3.providers.WebsocketProvider(process.env.WEB3_PROVIDER);
const web3 = new Web3(provider);
const contract = new web3.eth.Contract(contractABI, contractAddress);
const decoder = new InputDataDecoder(contractABI);
// console.log(decoder);


const BlurPool = {
  balanceOf: async (address) => {
    try {
      const balance = await contract.methods.balanceOf(address).call();
      const balanceInEth = web3.utils.fromWei(balance, 'ether');
      console.log(`Balance of ${address} is ${balanceInEth} ETH`);
      return {balance: balanceInEth};
    } catch (e) {
      console.log(e);
      return {balance: null};
    }

  }
}


module.exports = {contract, web3, decoder, BlurPool};
