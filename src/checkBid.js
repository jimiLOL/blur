require('dotenv').config()

const { collectionBidPriceUpdatesWatch, getBestPrice } = require('./socket');
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
// let magicValMin = 0;
// let magicValPlus = 0;
class Calculate  {
    constructor() {
        this.magicValMin = 0;
        this.magicValPlus = 0;
      }
      plus(val) {
        this.magicValPlus+val;
        return this.magicValPlus;
      }
      min(val) {
        this.magicValMin+val;
        return this.magicValMin;

      }
      count() {
        return this.magicValMin+this.magicValPlus
      }
      getMin() {
        return this.magicValMin
      }
      clare() {
        this.magicValMin = 0;
        this.magicValPlus = 0;

      }
    
}
const calculate = new Calculate();

 
const bidRouter = async (contractAddress, account, ele, bid) => {
    console.log('switchBid contractAddress ' + contractAddress);
    console.log(bid); // то что в базе
    console.log(ele); // event
    console.log('calculate.count() ' + calculate.count());

    // надо дублировать сущность
  
    if (bid.total_eth*0.3 > ele.total_eth || calculate.count() > Math.ceil((bid.total_eth/bid.price)*0.5)) {
        console.log('bid.total_eth*0.3 > ele.total_eth');

        console.log(bid.total_eth*0.3, ele.total_eth);
        console.log('calculate.count() > Math.ceil((bid.total_eth/bid.price)*0.5)');
        console.log(calculate.count(), Math.ceil((bid.total_eth/bid.price)*0.5));
        // снимаем ставку если наш bid упал до 30% от нашей ставки
        await switchBid.deleteBid(contractAddress, account, bid);
        calculate.clare();
        BlurPoolClass.clearBalance(account.walletAddress); // очищаем баланс после сделки, что бы получить снова

        
    } else if (bid.total_eth > ele.total_eth) {
        const val = (bid.total_eth-ele.total_eth)/ele.price;
        calculate.min(val);

        console.log('bid.total_eth > ele.total_eth');
        // объем ставок уменьшился
        
    } else if (bid.total_eth < ele.total_eth) {
        const val = (ele.total_eth-bid.total_eth)/ele.price;

        calculate.plus(val)
        console.log('bid.total_eth < ele.total_eth');
        // объем ставок увеличился
        
    } 
    // else if (bid.total_eth == ele.total_eth && calculate.getMin() > 100) {
    //     console.log('bid.total_eth === ele.total_eth');

    //     calculate.plus(calculate.getMin())



    // }
    return

}

const checkMinPrice = (price, contract) => {
    if (!getBestPrice().hasOwnProperty(contract)) {
        return false

    }
    const d = getBestPrice()[contract].bestPrice;
    // console.log(d);
   const p = (Number(price)/Number(getBestPrice()[contract].bestPrice))*100;
//    console.log(p);
   return p > 60 ? true:false;
   // мы говорим что нас интересуют сделки больше 60% от лучшего прайса, чтобы быть всегда в верху стакана
}

const check = async (accountAvailable) => {
    accountAvailable.forEach(async account => {
        // console.log(account);
      switchBid.login(account)

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
                    // console.log(Number(BlurPoolClass.walletSetBalance[account.walletAddress].balance), Number(price));
                    // у нас отсортированый массив по возрастанию цены, поэтмоу мы просто смотрим где у нас подходит условие под balance*3
                    // checkMinPrice(price, key)
                    // if (await clientRedis.exists(`blur_contract_${key}_walletAddress_${account.walletAddress}_bid_${price}`)) {
                    //     await clientRedis.del(`blur_contract_${key}_walletAddress_${account.walletAddress}_bid_${price}`)


                    //     }
                    
                    if (ele[price].total_eth > BlurPoolClass.walletSetBalance[account.walletAddress].balance*3 && Number(BlurPoolClass.walletSetBalance[account.walletAddress].balance) >= Number(price) && checkMinPrice(price, key)) {
                        // console.log('total_eth ' + ele[price].total_eth);
                        // console.log('price ' + ele[price].price);
                      
                        const bid = await clientRedis.get(`blur_contract_${key}_walletAddress_${account.walletAddress}_bid_${price}`);
                        if (!bid && ele[price].bidderCount > 10) {
                            // проверем что участников торгов больше 10
                            console.log('already bid ' + price);
                          await switchBid.setBid(key, account, ele[price], BlurPoolClass.walletSetBalance[account.walletAddress].balance);
                        } else if (bid) {
                            let bid_obj = JSON.parse(bid);
                            // console.log(bid_obj);
                          await bidRouter(key, account, ele[price], bid_obj);

                        }
                    }
    
                });
    
    
    
            });
        }


    });




   

}




module.exports = { checkBid };