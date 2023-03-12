require("dotenv/config")
const Web3ProviderEngine = require("web3-provider-engine");
const RPCSubprovider = require("web3-provider-engine/subproviders/rpc");
const Web3 = require('web3');

const MnemonicWalletSubprovider = require("@0x/subproviders")
    .MnemonicWalletSubprovider;
// const { createAlchemyWeb3 } = require("@alch/alchemy-web3");

// const AlchemyWeb3Provider = require('@alch/alchemy-web3/provider-engine');
// const { createAlchemyWeb3 } = require('@alch/alchemy-web3');

// const crypto = require('crypto');


const { loginBlur } = require('./loginBlur');

const { getBlurSign } = require('./getBlurSign');


let web3Client;


const newCookies = async () => {
    const cookies = await getBlurSign().then(async ({ data, headers }) => {
        console.log(data, headers);
        return await getSession(data.message).then(async (sigObj) => {
            console.log(sigObj);
            data.signature = sigObj.signature;
            console.log(data);
            // const hmac = crypto.createHmac('sha256', process.env.PRIVATE_KEY);
            // hmac.update(data.message);
            // const digest = hmac.digest('hex');
            // const data = {
            //     message: data.message,
            //     walletAddress: account.address,
            //     expiresOn: new Date().toISOString(),
            //   };

            return await loginBlur(data, headers).catch(err => {
                return err.response.data
            });
        });

    });




    return cookies;
}




async function getSession(msg = 'test') {
    web3Client = new Web3(process.env.WEB3_PROVIDER);
    const sigObj = await messageSign(msg);
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


function messageSign(msg, element) {
    return new Promise(async (resolve, reject) => {



        // let msg = 'DEFI WARRIOR f2de3efa6de740979420d73cedc2de14.SkENCLnurwfxImLpjmJqUPAuHOdWUdKjJtnXAGykQqgbAYWauELZtDnYjrEDfrtXNVvoLQSQXKZBUcfuMYnpJEjgEriClTGUNoRDiwtrXNdrLrXhJwUxfCmhhhVeBHfaFOafpYiXJSZsYCsoPiDRRr';
        //   let privateKey = await decryptSecretKey(element.secretKey, element.walletAddress); // element.walletAddress сделано для теста т.к пароль является адресом кошелька, надо будет заменить на подпись\хеш, которую мы получим от метомаска
        let sigObj = await web3Client.eth.accounts.sign(msg, process.env.PRIVATE_KEY); // приват ключи у нас ивестны и хранятся в незащищенном виде.

        resolve(sigObj)
    })


}

async function decryptSecretKey(keystoreJsonV3, password) {

    let decrypt = await web3Client.eth.accounts.decrypt(keystoreJsonV3, password);

    return decrypt
};

module.exports = { newCookies }