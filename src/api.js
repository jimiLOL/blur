
const EventEmitter = require('events');
const emitter = new EventEmitter();
const switchBid = require('./switchBid');
const { newCookies } = require('./getSession');

``
const { checkUserBid } = require('./checkUserBid');
const { statusEnableScript, getEmitter } = require('./checkBid');
const axios = require('axios')

getEmitter(emitter)

function getStatusWork(req, res) {
    return res.status(200).send({ title: 'ok', data: statusEnableScript() });

}
async function cancelBidForWallet(req, res) {
    const { wallet } = req.body;

    const body = {
        phone: wallet,
        enable: false
    };
    const accountAvailable = await newCookies();
    let account = accountAvailable.find(x => x.walletAddress == wallet);
    if (account) {
       const result = await checkUserBid(account).then(async (data) => {

            if (data.success) {
                const arrayPromise = [];
                for (let i = 0; i < data.priceLevels.length; i++) {
                    const element = data.priceLevels[i];
                    // console.log(element);
                    arrayPromise.push(await switchBid.deleteBid(element.contractAddress, account, element))

                }
                return await Promise.allSettled(arrayPromise);


            } else {
                return null
            }


        });

        await axios.post('https://gr100.greedyrats.com/api/switcher_account', body).catch(e => {
            console.log(e);
        })
        return res.status(200).send({title: 'Bid cancel', code: 200, data: result})

    } else {
        return res.status(200).send({title: 'Account not found', code: 400, data: []})

    }



}
async function switchEnableScript(req, res) {
    // await clientRedis.set('enableBidBlur', !enableBid);
    // enableBid = !statusEnableScript();

    emitter.emit('switchWorkScript', !statusEnableScript())



    return res.status(200).send({ title: 'ok', data: statusEnableScript() });


}

async function cancelAllBid(req, res) {
    // await clientRedis.set('enableBidBlur', false);
    // enableBid = false;
    emitter.emit('switchWorkScript', false);


    const accountAvailable = await newCookies();
    const promiseArray = [];

    for (let index = 0; index < accountAvailable.length; index++) {
        const account = accountAvailable[index];
        promiseArray.push(await checkUserBid(account).then(async (data) => {

            if (data.success) {
                const arrayPromise = [];
                for (let i = 0; i < data.priceLevels.length; i++) {
                    const element = data.priceLevels[i];
                    // console.log(element);
                    arrayPromise.push(await switchBid.deleteBid(element.contractAddress, account, element))

                }
                return await Promise.allSettled(arrayPromise);


            } else {
                return null
            }


        }));




    }
    const data = await Promise.allSettled(promiseArray).then((data) => {
        console.log(data);
        return data
    })


    return res.status(200).send({ title: 'ok', data: data });





}

const exportEmitter = () => {
    return Promise((resolve)=> {
        setInterval(() => {
            if (emitter) {
                resolve(emitter)
            }
            
        }, 200);
    })
};
const exportObj = {switchEnableScript, getStatusWork, cancelBidForWallet, cancelAllBid, emitter};

function e() {
    return new Promise((resolve)=> {
        setInterval(async () => {
            if (await exportEmitter()) {
                resolve(exportObj)

            }
        }, 200);
      

    })
}
module.exports = {switchEnableScript, getStatusWork, cancelBidForWallet, cancelAllBid, emitter}