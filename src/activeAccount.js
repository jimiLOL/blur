
const axios = require('axios');

const URL_SERVICE = 'https://gr100.greedyrats.com'

class ActiveAccount {

    constructor() {

        this.accounts = [];

    }



    async getAccount() {
        // console.log(this.accounts);
        let accountsResponse;
        if (this.accounts.length === 0) {
            await axios.get(`${URL_SERVICE}/api/get_enable_account`).then(res => {
                // console.log(res.data.data);
                accountsResponse = res.data.data;
            });
            accountsResponse.forEach(account => {
                const resultObj = getBlurCookie(account);
                if (resultObj) {
                    this.accounts.push(resultObj);


                }


            });
            return this.accounts;
        } else {
            return this.accounts;

        }



    }
    async UpdateCookiesAccounts() {
        await axios.get(`${URL_SERVICE}/api/get_enable_account`).then(res => {
            this.accounts = res.data;
        })
        return this.accounts;

    }

}

const getBlurCookie = (cookies) => {
    // console.log(cookies.cookie);
    let walletAddress = null;
    let cookiesArray = JSON.parse(cookies.cookie);
    const cookie = cookiesArray.cookies.filter((cookie) => {
        return cookie.domain === '.blur.io';
    });

    let cook_str = '';

    walletAddress = cookiesArray.cookies.filter((cookie) => {
        return cookie.name === 'walletAddress';
    })[0]
    cook_str = cook_str.concat(walletAddress.name + '=' + walletAddress.value + ';');

    if (walletAddress && walletAddress?.value) {
        walletAddress = walletAddress.value;
    } else {
        return null
    }

    cookie.forEach(element => {

        let sub_srt = element.name + '=' + element.value + ';'
        cook_str = cook_str.concat(sub_srt)

    });
    // console.log(cook_str);
    return { cook_str: cook_str, phone: cookies.phone, walletAddress: walletAddress };
}

module.exports = ActiveAccount;