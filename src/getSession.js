require("dotenv/config") 
const Web3 = require('web3');

 

const {ethers} = require('ethers');
// let walletObj;

// Создаем провайдер для подключения к Ethereum-сети
const provider = new ethers.providers.WebSocketProvider('wss://eth-mainnet.g.alchemy.com/v2/_qSfSMAPno3c1rCcufjgEwdqUJmTmDbF');
// const signer = provider.getSigner();
// console.log(signer);

 


const { getModelWallet } = require('./model/cryptowallet');
const ActiveAccount = require('./activeAccount');


let web3Client;

const newActiveAccount = new ActiveAccount();
let accountArray;

setInterval(() => {
    accountArray = newActiveAccount.UpdateCookiesAccounts();
    // получаем обновленные данные аккаунтов

}, 20000);
const newCookies = async () => {
    accountArray = await newActiveAccount.getAccount();
    // console.log('В работе ' + accountArray.length + ' аккаунтов');
    return accountArray;
    //   return await getBlurSign(cookies).then(async ({ data, headers }) => {
    //         console.log(data, headers);
    //         return await getSign(data.message).then(async (sigObj) => {
    //             console.log(sigObj);
    //             data.signature = sigObj.signature;
    //             console.log(data);
    //             // const hmac = crypto.createHmac('sha256', process.env.PRIVATE_KEY);
    //             // hmac.update(data.message);
    //             // const digest = hmac.digest('hex');
    //             // const data = {
    //             //     message: data.message,
    //             //     walletAddress: account.address,
    //             //     expiresOn: new Date().toISOString(),
    //             //   };

    //             return await loginBlur(data, headers).catch(err => {
    //                 return err.response.data
    //             });
    //         });

    //     });




    // return cookies;
}




async function getSign(msg = 'test', walletAddress) {
    web3Client = new Web3(process.env.WEB3_PROVIDER);
    const sigObj = await messageSignForAutorizate(msg, walletAddress);
    return sigObj




    // const MNEMONIC = process.env.MNEMONIC;
    // const BASE_DERIVATION_PATH = `44'/60'/0'/0`;

    // const mnemonicWalletSubprovider = new MnemonicWalletSubprovider({
    //     mnemonic: MNEMONIC,
    //     baseDerivationPath: BASE_DERIVATION_PATH,
    // });

    // const alchemyWeb3Provider = new RPCSubprovider({
    //     rpcUrl: process.env.WEB3_PROVIDER
    // });

    // const providerEngine = new Web3ProviderEngine();

    // providerEngine.addProvider(mnemonicWalletSubprovider);
    // providerEngine.addProvider(alchemyWeb3Provider);
    // providerEngine.start();


    // web3Client = new Web3(providerEngine);
    // console.log(web3Client);

    // const accounts = await web3Client.eth.accounts.wallet.getAddresses();
    // // const account = accounts[0]; // выбираем первый аккаунт
    // console.log(accounts);


    // const message = 'Hello, world!';

    // const signature = await web3Client.eth.sign(message, account.address);
    // console.log(`Message: ${message}`);
    // console.log(`Address: ${account.address}`);
    // console.log(`Signature: ${signature}`);



}

async function getSignV4(msg, walletAddress) {
    if (!msg) {
        return null;
    }
    web3Client = new Web3(process.env.WEB3_PROVIDER);
    const sigObj = await messageSign(msg, walletAddress);
  
    return sigObj

}


function messageSign(msg, walletAddress) {
    return new Promise(async (resolve, reject) => {

        const modelWallet = await getModelWallet();

        const wallet = await modelWallet.findOne({ walletAddress: walletAddress });
        // console.log("wallet");
        // console.log(wallet);
        if (!wallet) reject(null);



        const { privateKey } = await decryptSecretKey(wallet.secretKey, walletAddress); // element.walletAddress сделано для теста т.к пароль является адресом кошелька, надо будет заменить на подпись\хеш, которую мы получим от метомаска
        console.log(privateKey);
        // walletObj = new ethers.Wallet('0940e5a0a8d1f5b26638671f7e91388c6ba689a86c45361f1d71b8804d439dc2', web3Client);

        // const sign = signTypedDataController.signTypedData(msg);
        // console.log(sign);

        const ss = await getSignTypedData(msg.domain, msg.types, msg.value, privateKey.replace('0x', ''));
        // console.log(ss);

     
       



        // let sigObj = await web3Client.eth.accounts.sign(ethers.utils.arrayify(msg), '0940e5a0a8d1f5b26638671f7e91388c6ba689a86c45361f1d71b8804d439dc2'); // приват ключи у нас ивестны и хранятся в незащищенном виде.

        resolve(ss)
    })


}


async function getSignTypedData(domain,types,value, privateKey) {
    const walletEthres = new ethers.Wallet(privateKey, provider);
    const signature = await walletEthres._signTypedData(domain, types, value);
    // console.log(signature);
    return signature;

}
async function messageSignForAutorizate(msg, walletAddress) {
    const modelWallet = await getModelWallet();

    const wallet = await modelWallet.findOne({ walletAddress: walletAddress });
    console.log("wallet");
    console.log(wallet);
    if (!wallet) return null;
    const { privateKey } = await decryptSecretKey(wallet.secretKey, walletAddress); // element.walletAddress сделано для теста т.к пароль является адресом кошелька, надо будет заменить на подпись\хеш, которую мы получим от метомаска
    console.log(privateKey);
  
    // const s = signCase(msg, privateKey.replace('0x', ''));

    // console.log(s);
    return await web3Client.eth.accounts.sign(msg, privateKey.replace('0x', '')); // приват ключи у нас ивестны и хранятся в незащищенном виде.
    return ss

}

async function decryptSecretKey(keystoreJsonV3, password) {

    let decrypt = await web3Client.eth.accounts.decrypt(keystoreJsonV3, password);

    return decrypt
};

module.exports = { newCookies, getSign, getSignV4 }