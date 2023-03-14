const { collectionBidPriceUpdatesWatch } = require('./socket');
const helper = require('./helper.js');
const { BlurPoolClass } = require('./contracts/blurContract');
const { newCookies } = require('./getSession');
const Redis = require("ioredis");
const clientRedis = new Redis(process.env.REDIS);

let balanceWalletBlurETh = {};


async function checkBid() {

    while (true) {
        const accountAvailable = await newCookies();


        await check(accountAvailable)

        await helper.timeout(200);
        // console.log(collectionBidPriceUpdatesWatch());


    }
}

const check = async (accountAvailable) => {
    accountAvailable.forEach(async account => {
        // console.log(account.walletAddress);
        await BlurPoolClass.balanceOf(account.walletAddress);
        console.log(BlurPoolClass.walletSetBalance[account.walletAddress]);


        if (collectionBidPriceUpdatesWatch()) {
            Object.keys(collectionBidPriceUpdatesWatch()).forEach(key => {
                console.log('keys ' + key);
                const ele = collectionBidPriceUpdatesWatch()[key];
                let keys = Object.keys(ele);
                keys.sort((a, b) => {
                    return Number(ele[a].price) - Number(ele[b].price);
                });
                console.log('Price Array ' + keys);
    
                keys.forEach(price => {
                    // console.log(ele[price]);
                    // console.log(ele[price].total_eth);
                    if (ele[price].total_eth > BlurPoolClass.walletSetBalance[account.walletAddress].balance*3) {
                        console.log('total_eth ' + ele[price].total_eth);
                        console.log('price ' + ele[price].price);
                    }
    
                });
    
    
    
            });
        }


    });




   

}


module.exports = { checkBid };