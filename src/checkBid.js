require('dotenv').config()

const { collectionBidPriceUpdatesWatch, getBestPrice } = require('./socket');
const helper = require('./helper.js');
const { BlurPoolClass } = require('./contracts/blurContract');
const { newCookies } = require('./getSession');
const Redis = require("ioredis");
const clientRedis = new Redis(process.env.REDIS);
const switchBid = require('./switchBid');

 
let enableBid = true;

 

function getEmitter(emitter) {
    emitter.on('switchWorkScript', (data) => {
        enableBid = data;
    })
}


const statusEnableScript = () => {
    return enableBid

}


class checkPercent {
    constructor() {
        this.min = 99.2;
        this.max = 99.8;
        this.date = new Date().getTime();
    }
    async getPercent() {
        if (this.date + 1000 * 60 * 5 < new Date().getTime()) {
            this.date = new Date().getTime();
            const strPercentBlur = await clientRedis.get('blur_percent');
            console.log(strPercentBlur);
            const ArrayBlurPercent = strPercentBlur.split(',');
            this.min = ArrayBlurPercent[0];
            this.max = ArrayBlurPercent[1];
            return { min: this.min, max: this.max }
        } else {
            return { min: this.min, max: this.max }
        }

    }
}
const getP = new checkPercent();

async function checkBid() {
    // enableBid = await clientRedis.get('enableBidBlur');


    while (enableBid) {
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
class Calculate {
    constructor() {
        // this.magicValMin = 0;
        // this.magicValPlus = 0;
        this.contract = {};
    }
    plus(val, contract) {
        this.contract[contract].magicValPlus = this.contract[contract].magicValPlus + val;
        return this.contract[contract].magicValPlus;
    }
    min(val, contract) {
        this.contract[contract].magicValMin = this.contract[contract].magicValMin + val;
        return this.contract[contract].magicValMin;

    }
    count(contract) {
        return this.contract[contract].magicValMin + this.contract[contract].magicValPlus
    }
    getMin(contract) {
        return this.contract[contract].magicValMin
    }
    clare(contract) {
        this.contract[contract].magicValMin = 0;
        this.contract[contract].magicValPlus = 0;

    }
    contractSet(contract) {
        if (!this.contract.hasOwnProperty(contract)) {
            this.contract[contract] = { contract: contract, magicValMin: 0, magicValPlus: 0 };

        }

    }

}
const calculate = new Calculate();

const copyObj = {};
const errorCancel = {};


const bidRouter = async (contractAddress, account, ele, bid) => {
    calculate.contractSet(contractAddress)

    // console.log('switchBid contractAddress ' + contractAddress);
    // console.log(bid); // то что в базе
    // console.log(ele); // event
    // console.log('calculate.count() ' + calculate.count(contractAddress));

    // const accountLoginDate = switchBid.loginAccount


    if (!copyObj[`${contractAddress}_${ele.price}`]) {
        copyObj[`${contractAddress}_${ele.price}`] = { ...ele };


    } else if (copyObj[`${contractAddress}_${ele.price}`].total_eth != ele.total_eth || errorCancel[`${contractAddress}_${ele.price}`]) {
        // console.log(copyObj[`${contractAddress}_${ele.price}`], ele);

        if (bid.total_eth * 0.3 > ele.total_eth || calculate.count(contractAddress) > Math.ceil((bid.total_eth / bid.price) * 0.25) || bid.time < (new Date().getTime() - 1000 * 60 * 10) || account.date_login < (new Date().getTime() - 1000 * 60 * 26)) {
            // console.log('Снимаем ставку перед разлогином ' + account.date_login < (new Date().getTime() - 1000 * 60 * 28));
            // console.log();

            // console.log(bid.total_eth * 0.3, ele.total_eth);
            // console.log('calculate.count() > Math.ceil((bid.total_eth/bid.price)*0.5)');
            // console.log(calculate.count(contractAddress), Math.ceil((bid.total_eth / bid.price) * 0.5));
            // снимаем ставку если наш bid упал до 30% от нашей ставки
            await switchBid.deleteBid(contractAddress, account, bid).then(res => {
                if (res && res?.statusCode != 400 || res?.success) {
                    console.log('success cancel bid ' + contractAddress + ' bid price ' + bid.price + ' time ' + new Date());
                    console.log(res);

                    calculate.clare(contractAddress);
                    errorCancel[`${contractAddress}_${ele.price}`] = false;
                    return

                } else if (res?.statusCode == 400 && res?.message == 'No bids found') {
                    calculate.clare(contractAddress);

                    console.log('error cancel bid ' + contractAddress + ' bid price ' + bid.price + ' time ' + new Date());
                    console.log(res);
                    errorCancel[`${contractAddress}_${ele.price}`] = false;
                    return


                } else {
                    errorCancel[`${contractAddress}_${ele.price}`] = true;
                    return

                }

            }).catch(e => {
                console.log('error cancel bid ' + contractAddress + ' bid price ' + bid.price + ' time ' + new Date());
                console.log(e?.data);
            });
            BlurPoolClass.clearBalance(account.walletAddress); // очищаем баланс после сделки, что бы получить снова



        } else if (bid.total_eth > ele.total_eth) {
            const val = (bid.total_eth - ele.total_eth) / ele.price;
            const result = calculate.min(Math.ceil(val), contractAddress);

            console.log('bid.total_eth > ele.total_eth + val ' + result);
            // объем ставок уменьшился

        } else if (bid.total_eth < ele.total_eth) {
            const val = (ele.total_eth - bid.total_eth) / ele.price;

            const result = calculate.plus(Math.ceil(val), contractAddress)
            console.log('bid.total_eth < ele.total_eth + ' + result);
            // объем ставок увеличился

        }
        copyObj[`${contractAddress}_${ele.price}`] = { ...ele };



    }

    // надо дублировать сущность


    // else if (bid.total_eth == ele.total_eth && calculate.getMin() > 100) {
    //     console.log('bid.total_eth === ele.total_eth');

    //     calculate.plus(calculate.getMin())



    // }
    return

}

const checkMinPrice = (price, contract, { min, max }) => {
    // const { min, max } = await getP.getPercent();
    // console.log(min, max);
    if (!getBestPrice().hasOwnProperty(contract)) {
        return false

    }
    // const d = getBestPrice()[contract].bestPrice;
    const p = ((Number(price) / Number(getBestPrice()[contract].bestPrice)) * 100).toFixed(1);
    // console.log('checkMinPrice ' + p + ' price ' + price + ' BestPrice ' + d + ' result ' + result);

    return p < max && p > min ? true : false;
    // мы говорим что нас интересуют сделки больше 98% от лучшего прайса, чтобы быть всегда в верху стакана
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
                    return Number(ele[b].price) - Number(ele[a].price);
                });
                // console.log('Price Array ' + keys);
                if (getBestPrice()[key]?.bestPrice) {
                    let filterPrice = keys.filter(x => Number(x) <= Number(getBestPrice()[key].bestPrice))

                    filterPrice.forEach(async price => {
                        // console.log(ele[price]);
                        // console.log(ele[price].total_eth);
                        // console.log(Number(BlurPoolClass.walletSetBalance[account.walletAddress].balance), Number(price));
                        // у нас отсортированый массив по возрастанию цены, поэтмоу мы просто смотрим где у нас подходит условие под balance*3
                        // checkMinPrice(price, key)
                        // if (await clientRedis.exists(`blur_contract_${key}_walletAddress_${account.walletAddress}_bid_${price}`)) {
                        //     await clientRedis.del(`blur_contract_${key}_walletAddress_${account.walletAddress}_bid_${price}`)


                        // }


                        // console.log('total_eth ' + ele[price].total_eth);
                        // console.log('price ' + ele[price].price);

                        const bid = await clientRedis.get(`blur_contract_${key}_walletAddress_${account.walletAddress}_bid_${price}`);
                        // const bid = null;
                        let bid_obj = null;
                        if (bid) {
                            bid_obj = JSON.parse(bid);
                            // console.log(bid_obj);

                        }
                        ele[price].time = new Date().getTime();

                        if (!bid && ele[price].bidderCount >= ele[price].count_people || bid_obj?.count?.count < 20) {
                            const time = account.date_login < (new Date().getTime() - 1000 * 60 * 25);
                            const s = ele[price].total_eth > BlurPoolClass.walletSetBalance[account.walletAddress].balance * 3 && Number(BlurPoolClass.walletSetBalance[account.walletAddress].balance) >= Number(price) && checkMinPrice(price, key, { min: ele[price].min_percent, max: ele[price].max_percent });
                            if (s && !time) {
                                // console.log('already bid ' + price);
                                await switchBid.setBid(key, account, ele[price], BlurPoolClass.walletSetBalance[account.walletAddress].balance);

                            }
                            // проверем что участников торгов больше 10

                        } else if (bid) {
                            // let bid_obj = JSON.parse(bid);
                            // console.log(bid_obj);
                            await bidRouter(key, account, ele[price], bid_obj.bid);

                        }

                    });
                }




            });
        }


    });






}




module.exports = { checkBid, statusEnableScript, getEmitter };