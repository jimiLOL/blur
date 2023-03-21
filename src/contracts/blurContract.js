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


const BlurPoolClass = {

  wallet: {},
  async balanceOf(address) {
    try {
      if (this.wallet.hasOwnProperty(address) && this.wallet[address].balance !== null) {
        // console.log('class');
        // console.log(this.wallet[address]);
        return this.wallet[address];

      } else {
        this.wallet[address] = { balance: null }
      }

      const balance = await contract.methods.balanceOf(address).call();
      const balanceInEth = web3.utils.fromWei(balance, 'ether');
      this.wallet[address].balance = balanceInEth;
      // console.log(`Balance of ${address} is ${balanceInEth} ETH`);
      this.clearBalance(address);
      return this.wallet[address];
    } catch (e) {
      console.log(e);
      return { balance: null };
    }

  },

  get walletSetBalance() {
    return this.wallet;
  },

  clearBalance(address) {
    setTimeout(() => {
      this.wallet[address].balance = null;

    }, 1000);
  }
}

// const BlurPool = {
//   wallet: {},
//   balanceOf: async (address) => {
//     try {
//       if (this.wallet.hasOwnProperty(address) && this.wallet[address].balance) {
//         return this.wallet[address];

//       } else {
//         this.wallet[address] =  {balance: null}
//       }
//      const balance = await contract.methods.balanceOf(address).call();
//       const balanceInEth = web3.utils.fromWei(balance, 'ether');
//       this.wallet[address].balance = balanceInEth;
//       // console.log(`Balance of ${address} is ${balanceInEth} ETH`);
//       this.clearBalance(address);
//       return this.wallet[address];
//     } catch (e) {
//       console.log(e);
//       return {balance: null};
//     }

//   },
//   clearBalance: (address)=> {
//     setTimeout(() => {
//       this.wallet[address].balance = null;

//     }, 30000);
//   }
// }


module.exports = { contract, web3, decoder, BlurPoolClass };
