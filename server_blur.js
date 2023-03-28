const { Alchemy, Network, NftSaleMarketplace } = require("alchemy-sdk");

const CronJob = require("cron").CronJob;
const CronTime = require("cron").CronTime;


// const dataCron = new Date();
// dataCron.setSeconds(dataCron.getSeconds() + 60);

// const reloadServer = () => {


//     // process.exit(1)
//     console.log('Start cron');
//     return
// }
// const job = new CronJob(dataCron, reloadServer());

// // job.start()


// function startCron(cron, time) {
//     let d = new Date();
//     d.setSeconds(d.getSeconds() + time);
//     cron.setTime(new CronTime(d));
//     cron.start();
// }

// startCron(job, 7200)


const { start } = require('./src/socket');

(async () => {

    await start(); // начинаем получать данные с биржи

})();







const { getBalance } = require('./src/web3controller');

const body = {
    address: "0xb8F202dC3242A6b17d7Be5e2956aC2680EAf223c",
    network: "MAINNET"

}
getBalance(body).then((data) => {
    console.log(data);
})

const config = {
    apiKey: "_qSfSMAPno3c1rCcufjgEwdqUJmTmDbF",
    network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(config);

const main = async () => {

    // BAYC contract address
    const address = "0x363C5dC3ff5A93C9AB1ec54337d211148e10f567";

    // Get sales history of BAYC #1000
    const history = await alchemy.nft.getNftSales({
        fromBlock: 0,
        toBlock: 'latest',
        marketplace: NftSaleMarketplace.SEAPORT,
        contractAddress: address,
        tokenId: 3339,
    });

    console.log('history');
    console.log(history);


    const price = await alchemy.nft.getFloorPrice(address);
    console.log(price);


};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

// runMain();