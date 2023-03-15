require('dotenv').config()

const Redis = require("ioredis");
const clientRedis = new Redis(process.env.REDIS);

const { loginBlur } = require('./loginBlur');

const { getBlurSign } = require('./getBlurSign');
const { getSign } = require('./getSession');

const { getFromData } = require('./getFromData')

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
                this.loginAccount[account.walletAddress] = { date: new Date().getTime(), assessHashData: loginData };
                console.log(this.loginAccount[account.walletAddress]);

            }
        } else if (this.loginAccount[account.walletAddress]?.date < (new Date().getTime() - 1000 * 60 * 60) && taskRouter(account)) {
            console.log('Enable autorization');
            const loginData = await connectBlur(account);
            if (loginData) {
                this.loginAccount[account.walletAddress] = { date: new Date().getTime(), assessHashData: loginData };
                console.log(this.loginAccount[account.walletAddress]);

            }

        } else {
            console.log('Disable autorizate');
        }




    },
    async deleteBid(contractAddress, account, bid) {
        await clientRedis.del(`blur_contract_${contractAddress}_walletAddress_${account.walletAddress}_bid_${bid.price}`);

    }
}

const connectBlur = async (account) => {
    await getBlurSign(account).then(async ({ data, headers }) => {
        console.log(data, headers);
        return await getSign(data.message).then(async (sigObj) => {
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
            const loginData = await loginBlur(data, headers).catch(err => {
                return null
            });
            if (loginData) {
                return loginData
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