require('dotenv').config()

const Redis = require("ioredis");
const clientRedis = new Redis(process.env.REDIS);
const axios = require('axios');

const { loginBlur } = require('./loginBlur');

const { getBlurSign } = require('./getBlurSign');
const { getSign, getSignV4 } = require('./getSession');

const { getFromData } = require('./getFromData');
const { checkLogin } = require('./checkLogin');
const { submitBid } = require('./submitBid');
const { cancelBid } = require('./cancel');
const helper = require('./helper.js');
const taskLogin = new Map([]);


const bidCount = {}
const taskRouter = (account) => {
    // console.log(taskLogin);
    if (taskLogin.has(`loginTask_${account.walletAddress}`)) {
        const taskObj = taskLogin.get(`loginTask_${account.walletAddress}`);
        if (taskObj.date > (new Date().getTime() - 1000 * 60 * 1)) {
            return false
        } else {
            taskLogin.delete(`loginTask_${account.walletAddress}`);
            return true
        }
    } else {
        taskLogin.set(`loginTask_${account.walletAddress}`, { date: new Date().getTime() });
        return true
    }

}
const setBidVal = (countBid) => {
    if (countBid == 0) {
        return 1
    } else if (countBid >= 100) {
        return 90
    } else {
        return countBid

    }
} 

const switchBid = {
    loginAccount: {},
    async login(account) {
        const currentTime = new Date().getTime();

        if (!this.loginAccount.hasOwnProperty(account.walletAddress) && taskRouter(account) || this.loginAccount[account.walletAddress]?.date < (currentTime - 1000 * 30) && taskRouter(account)) {
            console.log('Re login init');
            const loginData = await connectBlur(account);
            if (loginData) {
                this.loginAccount[account.walletAddress] = { date: currentTime, accountData: loginData, count: 0 };
                // console.log(this.loginAccount[account.walletAddress]);

            }
        }

        return



    },
    async setBid(contractAddress, account, bid, myBalance) {

        const currentTime = new Date().getTime();

        if (!this.loginAccount.hasOwnProperty(account.walletAddress) && taskRouter(account)) {
            // авторизация не производилась
            console.log('Enable autorizate');
            const loginData = await connectBlur(account);
            if (loginData) {

                this.loginAccount[account.walletAddress] = { date: currentTime, accountData: loginData, count: 0, delete: 0 };
                console.log(this.loginAccount[account.walletAddress]);

            }
            return
        } else if (this.loginAccount[account.walletAddress]?.date < (currentTime - 1000 * 60 * 5) && taskRouter(account)) {
            // пользователь авторизован более 5 минут назад
            console.log('Enable autorization');
            const loginData = await connectBlur(account);
            if (loginData) {
                this.loginAccount[account.walletAddress] = { date: currentTime, accountData: loginData, count: 0, delete: 0 };
                console.log(this.loginAccount[account.walletAddress]);

            }
            return

        } else if (this.loginAccount[account.walletAddress]?.count == 0) {
            console.log('Disable autorizate');
            // мы говорим, что через 1 минуту возможна переавторизация
            this.loginAccount[account.walletAddress].count = 1; // жестко говорим, что с 1 аккаунта 1 покупка, позже сделаем чрез редис
            console.log(contractAddress);
            console.log(bid);
            const date = new Date();
            // date.setDate(date.getFullYear() + 1); // 1 yaer
            date.setMinutes(date.getMinutes() + 16);
            // date.setDate(date.getDate() + 1);
            const isoDate = date.toISOString();
            const countBid = Math.floor(myBalance * 0.99 / bid.price);
           
            const body = {
                price: {
                    unit: 'BETH',
                    amount: bid.price // 
                },
                quantity: setBidVal(countBid),
                expirationTime: isoDate,
                contractAddress: contractAddress,
            }
            // console.log(body);
            if (body.quantity == 0) {
                this.loginAccount[account.walletAddress].count = 0;

                return null
            };
            const setBid = await getFromData(body, this.loginAccount[account.walletAddress].accountData);
            // console.log(setBid);
            if (!setBid || setBid?.statusCode == 400 || !Array.isArray(setBid?.signatures)) {
                // проблемы с авторизацией удаляем объект авторизации, что бы выполнить авторизацию вновь
                delete this.loginAccount[account.walletAddress];
                return null
            }
            const sign = await getSignV4(setBid?.signatures[0]?.signData, account.walletAddress).catch(e=> {
                return null

            });
            if (!sign) {
                this.loginAccount[account.walletAddress].count = 0;
                return


            }
            // console.log("sign");
            // console.log(sign);
            const bodySub = {
                signature: sign,
                marketplaceData: setBid.signatures[0].marketplaceData
            }
            // console.log(bodySub);
            const sub = await submitBid(this.loginAccount[account.walletAddress].accountData, JSON.stringify(bodySub));
            // console.log(sub);
            // process.exit(0)
            if (sub?.statusCode == 400) {
                this.loginAccount[account.walletAddress].count = 0;

                return

            }
            if (sub?.data?.success) {
                if (!bidCount.hasOwnProperty(`${account.walletAddress}_${contractAddress}_${bid.price}`)) {
                    bidCount[`${account.walletAddress}_${contractAddress}_${bid.price}`] = { count: 0 };
                }
                bidCount[`${account.walletAddress}_${contractAddress}_${bid.price}`].count++
                await clientRedis.set(`blur_contract_${contractAddress}_walletAddress_${account.walletAddress}_bid_${bid.price}`, JSON.stringify({ bid: bid, count: bidCount[`${account.walletAddress}_${contractAddress}_${bid.price}`] }), 'ex', 60 * 16);
                this.loginAccount[account.walletAddress].count = 0;



            }
            return


            // process.exit(0)
        }






    },
    async deleteBid(contractAddress, account, bid) {
        if (this.loginAccount[account.walletAddress] && !this.loginAccount[account.walletAddress].delete) {
            this.loginAccount[account.walletAddress].delete = 1


            if (!this.loginAccount.hasOwnProperty(account.walletAddress)) {
                this.loginAccount[account.walletAddress].delete = 0;
                return null
            }

            return await cancelBid(contractAddress, this.loginAccount[account.walletAddress].accountData, bid).then(async res => {
                console.log('function cancelBid ' + contractAddress);
                console.log(res);
                if (bidCount.hasOwnProperty(`${account.walletAddress}_${contractAddress}_${bid.price}`)) {
                    bidCount[`${account.walletAddress}_${contractAddress}_${bid.price}`].count = 0;
                }
                if (res && res?.message != 'No bids found') {

                    this.loginAccount[account.walletAddress].delete = 0;

                     await clientRedis.del(`blur_contract_${contractAddress}_walletAddress_${account.walletAddress}_bid_${bid.price}`);
                     return res


                } else if (res?.message == 'No bids found') {

                    this.loginAccount[account.walletAddress].delete = 0;
                    await clientRedis.del(`blur_contract_${contractAddress}_walletAddress_${account.walletAddress}_bid_${bid.price}`);

                    return res

                } else if (res?.statusCode == 403) {
                    const loginData = await connectBlur(account);
                    

                    if (loginData) {
                        this.loginAccount[account.walletAddress] = { date: currentTime, accountData: loginData, count: 0, delete: 0 };
                        console.log(this.loginAccount[account.walletAddress]);
    
                    }

                    this.loginAccount[account.walletAddress].delete = 0;
                    return null
                } else if (res?.success) {
                    await helper.timeout(10000);

                    this.loginAccount[account.walletAddress].delete = 0;
                    await clientRedis.del(`blur_contract_${contractAddress}_walletAddress_${account.walletAddress}_bid_${bid.price}`);

                    return res

                }
                


            }).catch(async e => {
                const loginData = await connectBlur(account);
                if (loginData) {
                    this.loginAccount[account.walletAddress] = { date: currentTime, accountData: loginData, count: 0, delete: 0 };
                    console.log(this.loginAccount[account.walletAddress]);

                }
                return null
            });


        }
        return


    }
}

const connectBlur = async (account) => {
    // console.log(account);
    const login = await checkLogin(account);
    // console.log(login);
    // process.exit(0)
    if (login && login?.data?.success) {
        console.log('Login online walletAddress ' + account.walletAddress);
        await clientRedis.set(`login_blur_${account.walletAddress}`, 1, 'ex', 600);
        return account
    }
      axios.post('https://node.greedyrats.com/api/loginblurstatus', { wallet: account.walletAddress, enable: false }).catch(e=> {
        console.log(e.message);
     });

    return await getBlurSign(account).then(async ({ data, headers, agent }) => {
        if (!data || !headers) {
            await clientRedis.set(`login_blur_${account.walletAddress}`, 0, 'ex', 600);

            return null
        }
        // console.log(data, headers);

        return await getSign(data.message, account.walletAddress).then(async (sigObj) => {
            // console.log(sigObj);
            data.signature = sigObj.signature;
            // console.log(data);
            // const hmac = crypto.createHmac('sha256', process.env.PRIVATE_KEY);
            // hmac.update(data.message);
            // const digest = hmac.digest('hex');
            // const data = {
            //     message: data.message,
            //     walletAddress: account.address,
            //     expiresOn: new Date().toISOString(),
            //   };
            // const date = new Date();
            // date.setMonth(date.getDay() + 1);
            // data.expiresOn = date.toISOString();
            // console.log(data);
            const loginData = await loginBlur(data, headers, agent).then(res => {
                console.log('loginBlur');
                console.log(res);
                return res
            }).catch(err => {
                console.log(err);
                return null
            });
            console.log(loginData);
            if (loginData) {
                 axios.post('https://node.greedyrats.com/api/loginblurstatus', { wallet: account.walletAddress, enable: true }).catch(e=> {
                    console.log(e.message);
                 });

                await clientRedis.set(`login_blur_${account.walletAddress}`, 1, 'ex', 600);
                account = updateCookie(account, loginData.accessToken);


                account.authToken = loginData.accessToken
                return account
            } else {
                await clientRedis.set(`login_blur_${account.walletAddress}`, 0, 'ex', 600);

                return null
            }

        });

    }).catch(async e => {
        console.log(e);
        await clientRedis.set(`login_blur_${account.walletAddress}`, 0, 'ex', 600);

        return null
    });

}
function updateCookie(account, accessToken) {
    console.log(account);
    let cookiesArray = account.cook_str.split(';');
    let findEle = 0;
    for (let index = 0; index < cookiesArray.length; index++) {
        const element = cookiesArray[index];
        if (element.includes('authToken')) {
            findEle++;
            const newToken = `authToken=${accessToken}`
            cookiesArray.splice(index, 1, newToken)



        }

    }
    if (findEle == 0) {
        cookiesArray.push(`authToken=${accessToken}`)

    }
    const result = arr.join(";");
    account.cook_str = result;
    return account


}
module.exports = switchBid;