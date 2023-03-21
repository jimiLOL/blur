require('dotenv').config()

const { collectionBidPriceUpdatesWatch } = require('./socket');
const helper = require('./helper.js');
const { BlurPoolClass } = require('./contracts/blurContract');
const { newCookies } = require('./getSession');
const Redis = require("ioredis");
const clientRedis = new Redis(process.env.REDIS);
const switchBid  = require('./switchBid');

let balanceWalletBlurETh = {};


async function checkBid() {

    while (true) {
        const accountAvailable = await newCookies();

        if (accountAvailable) {
            await check(accountAvailable)

        } else {
            console.log('Нет включенных в работу аккаунтов!');
        }



        await helper.timeout(200);
        // console.log(collectionBidPriceUpdatesWatch());


    }
}

const bidRouter = async (contractAddress, account, ele, bid) => {
    console.log('switchBid');
    console.log(bid);
    console.log(ele);
    if (bid.total_eth*0.3 > ele.total_eth) {
        console.log('bid.total_eth*0.5 > ele.total_eth');
        // снимаем ставку если наш bid упал до 30% от нашей ставки
        await switchBid.deleteBid(contractAddress, account, bid)
        
    } else if (bid.price < ele.price) {
        console.log('bid.price > ele.price');
        // объем ставок увеличился
        
    } else if (bid.price == ele.price) {
        console.log('bid.price == ele.price');
        // ситуация на рынке не изменилась
        
    }

}

const check = async (accountAvailable) => {
    accountAvailable.forEach(async account => {
        // console.log(account);
        await BlurPoolClass.balanceOf(account.walletAddress);
        // console.log(BlurPoolClass.walletSetBalance[account.walletAddress]);


        if (collectionBidPriceUpdatesWatch()) {
            Object.keys(collectionBidPriceUpdatesWatch()).forEach(key => {
                // console.log('keys ' + key);
                const ele = collectionBidPriceUpdatesWatch()[key];
                let keys = Object.keys(ele);
                keys.sort((a, b) => {
                    return Number(ele[a].price) - Number(ele[b].price);
                });
                // console.log('Price Array ' + keys);
    
                keys.forEach(async price => {
                    // console.log(ele[price]);
                    // console.log(ele[price].total_eth);
                    // у нас отсортированый массив по возрастанию цены, поэтмоу мы просто смотрим где у нас подходит условие под balance*3
                    if (ele[price].total_eth > BlurPoolClass.walletSetBalance[account.walletAddress].balance*3 && Number(BlurPoolClass.walletSetBalance[account.walletAddress].balance) > Number(price)) {
                        // console.log('total_eth ' + ele[price].total_eth);
                        // console.log('price ' + ele[price].price);
                        const bid = await clientRedis.get(`blur_contract_${key}_walletAddress_${account.walletAddress}_bid_${price}`);
                        if (!bid && ele[price].bidderCount > 10) {
                            // проверем что участников торгов больше 10
                            console.log('already bid ' + price);
                          await switchBid.setBid(key, account, ele[price], BlurPoolClass.walletSetBalance[account.walletAddress].balance)
                        } else if (bid) {
                            let bid_obj = JSON.parse(bid);
                            console.log(bid_obj);
                          await bidRouter(key, account, ele[price], bid);

                        }
                    }
    
                });
    
    
    
            });
        }


    });




   

}




module.exports = { checkBid };