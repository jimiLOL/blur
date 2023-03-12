const {collectionBidPriceUpdatesWatch} = require('./socket');
const helper = require('./helper.js');
const {BlurPool} = require('./contracts/blurContract');
async function checkBid() {
    while (true) {

        await check()

        await helper.timeout(200);
        // console.log(collectionBidPriceUpdatesWatch());

        
    }
}

const check = async () => {
    let balanceWalletBlurETh = await BlurPool.balanceOf('0xb8F202dC3242A6b17d7Be5e2956aC2680EAf223c');
    console.log(balanceWalletBlurETh);
    
    if (collectionBidPriceUpdatesWatch()) {
        Object.keys(collectionBidPriceUpdatesWatch()).forEach(key => {
            console.log('keys ' + key);
            const ele = collectionBidPriceUpdatesWatch()[key];
            let keys = Object.keys(ele);
            keys.sort((a, b) => {
                return Number(ele[a].price) - Number(ele[b].price);
            });
            console.log(keys);

            keys.forEach(price => {
                console.log(ele[price]);
                console.log(ele[price].total_eth); 
                
            });
          
    
            
        });
    }
 
}


module.exports = {checkBid};