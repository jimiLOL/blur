
const axios = require('axios');

const URL_SERVICE = 'https://gr100.greedyrats.com'

class ActiveAccount {

    constructor() {

        this.accounts = [];

    }



    async getAccount() {
        let accountsResponse;
        if (this.accounts.length === 0) {
            await axios.get(`${URL_SERVICE}/api/get_enable_account`).then(res => {
                // console.log(res.data.data);
                accountsResponse = res.data.data;
            });
            if (Array.isArray(accountsResponse) && accountsResponse.length > 0) {
                accountsResponse.forEach(account => {
                    const resultObj = getBlurCookie(account);
                    if (resultObj) {
                        this.accounts.push(resultObj);


                    }


                });
                return this.accounts;

            } else {
                return null
            }

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
    // console.log(cookies);
    let walletAddress = null;
    let cookiesArray = JSON.parse(cookies.cookie);
    const cookie = cookiesArray.cookies.filter((cookie) => {
        return cookie.domain === '.blur.io';
    });

    let cook_str = '';

    const coreApi_prod_blur_io = cookiesArray.cookies.filter((cookie) => {
        return cookie.domain === 'core-api.prod.blur.io';
    });
    coreApi_prod_blur_io.forEach(cookie => {
        cook_str = cook_str.concat(cookie.name + '=' + cookie.value + '; ');
        if (cookie.name == 'walletAddress') {
            walletAddress = cookie.value;

        }


    });


    // if (!walletAddress) {
    //     return null
    // }

    cookie.forEach(element => {

        if (element.name == '__cf_bm') {
            let sub_srt = element.name + '=' + element.value + '; '
            cook_str = cook_str.concat(sub_srt)
        } else if (element.name == 'cf_clearance') {
            let sub_srt = element.name + '=' + element.value
            cook_str = cook_str.concat(sub_srt)
        }



    });
    // console.log(cook_str);
    return { cook_str: cook_str, phone: cookies.phone, walletAddress: cookies.walletAddress, UserAgent: cookies.UserAgent };
}

module.exports = ActiveAccount;