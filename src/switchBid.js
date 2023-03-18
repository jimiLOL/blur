require('dotenv').config()

const Redis = require("ioredis");
const clientRedis = new Redis(process.env.REDIS);

const { loginBlur } = require('./loginBlur');

const { getBlurSign } = require('./getBlurSign');
const { getSign } = require('./getSession');

const { getFromData } = require('./getFromData');
const {checkLogin} = require('./checkLogin');
const {submitBid} = require('./submitBid');

const taskLogin = new Map([]);

const taskRouter = (account) => {
    // console.log(taskLogin);
    if (taskLogin.has(`loginTask_${account.walletAddress}`)) {
        const taskObj = taskLogin.get(`loginTask_${account.walletAddress}`);
        if (taskObj.date > (new Date().getTime() - 1000 * 60 * 10)) {
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

const switchBid = {
    loginAccount: {},
    async setBid(contractAddress, account, bid) {

        // await clientRedis.set(`blur_contract_${contractAddress}_walletAddress_${account.walletAddress}_bid_${bid.price}`, JSON.stringify(bid));
        if (!this.loginAccount.hasOwnProperty(account.walletAddress) && taskRouter(account)) {
            console.log('Enable autorizate');
            const loginData = await connectBlur(account);
            if (loginData) {
                this.loginAccount[account.walletAddress] = { date: new Date().getTime(), accountData: loginData, count: 0 };
                console.log(this.loginAccount[account.walletAddress]);

            }
        } else if (this.loginAccount[account.walletAddress]?.date < (new Date().getTime() - 1000 * 60 * 60) && taskRouter(account)) {
            console.log('Enable autorization');
            const loginData = await connectBlur(account);
            if (loginData) {
                this.loginAccount[account.walletAddress] = { date: new Date().getTime(), accountData: loginData, count: 0 };
                console.log(this.loginAccount[account.walletAddress]);

            }

        } else if (this.loginAccount[account.walletAddress]?.date > (new Date().getTime() - 1000 * 60 * 60) && this.loginAccount[account.walletAddress]?.count == 0) {
            console.log('Disable autorizate');
            this.loginAccount[account.walletAddress].count = 1; // жестко говорим, что с 1 аккаунта 1 покупка, позже сделаем чрез редис
            console.log(contractAddress);
            console.log(bid);
            const date = new Date();
            date.setDate(date.getFullYear() + 1); // 1 yaer
            const isoDate = date.toISOString();
            const body = {
                price: {
                    unit: 'BETH',
                    amount: '0.01' // bid.price
                },
                quantity: 1,
                expirationTime: isoDate,
                contractAddress: contractAddress,
            }
            const setBid = await getFromData(body, this.loginAccount[account.walletAddress].accountData);
            console.log(setBid);
            const sign = await getSign(setBid.signatures[0].marketplaceData, account.walletAddress)
            console.log(sign);
            const bodySub = {
                signature: sign.signature,
                marketplaceData: setBid.signatures[0].marketplaceData
            }
            console.log(bodySub);
            const sub = await submitBid(this.loginAccount[account.walletAddress].accountData, JSON.stringify(bodySub));
            console.log(sub);
            process.exit(0)
        }




    },
    async deleteBid(contractAddress, account, bid) {
        await clientRedis.del(`blur_contract_${contractAddress}_walletAddress_${account.walletAddress}_bid_${bid.price}`);

    }
}

const connectBlur = async (account) => {
    const login = await checkLogin(account);
    console.log(login);
    // process.exit(0)
    if (login && login?.data?.success) {
        return account
    }
    return await getBlurSign(account).then(async ({ data, headers }) => {
        if (!data || !headers) {
            return null
        }
        console.log(data, headers);

        return await getSign(data.message, account.walletAddress).then(async (sigObj) => {
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
            const loginData = await loginBlur(data, headers).then(res=> {
                console.log('loginBlur');
                console.log(res.data);
            }).catch(err => {
                console.log(err);
                return null
            });
            console.log(loginData);
            if (loginData) {
                account.authToken = loginData.authToken
                return account
            } else {
                return null
            }

        });

    }).catch(e => {
        console.log(e);
        return null
    });

}

module.exports = switchBid;