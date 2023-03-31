
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

            return this.calculateAccount(accountsResponse)
            

        } else {
            return this.accounts;

        }



    }
    async UpdateCookiesAccounts() {
        console.log('Update cookie account');
        let accountsResponse;

        await axios.get(`${URL_SERVICE}/api/get_enable_account`).then(res => {
            accountsResponse = res.data.data;

        })
        return this.calculateAccount(accountsResponse)

    }
    calculateAccount(accountsResponse) {
        if (Array.isArray(accountsResponse) && accountsResponse.length > 0) {
            this.accounts.splice(0, this.accounts.length-1);
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
    let authToken;

    const coreApi_prod_blur_io = cookiesArray.cookies.filter((cookie) => {
        return cookie.domain === 'core-api.prod.blur.io';
    });
    coreApi_prod_blur_io.forEach(cookie => {
        cook_str = cook_str.concat(cookie.name + '=' + cookie.value + '; ');
        if (cookie.name == 'walletAddress') {
            walletAddress = cookie.value;

        }
        if (cookie.name == 'authToken') {
            authToken = cookie.value

        }


    });


    // if (!walletAddress) {
    //     return null
    // }

    cookie.forEach(element => {
        let sub_srt = element.name + '=' + element.value + '; '
        cook_str = cook_str.concat(sub_srt)

        // if (element.name == '__cf_bm') {
        //     let sub_srt = element.name + '=' + element.value + '; '
        //     cook_str = cook_str.concat(sub_srt)
        // } else if (element.name == 'cf_clearance') {
        //     let sub_srt = element.name + '=' + element.value
        //     cook_str = cook_str.concat(sub_srt)
        // }



    });
    // console.log(cook_str);
    return { cook_str: cook_str, phone: cookies.phone, walletAddress: cookies.walletAddress, UserAgent: cookies.UserAgent, authToken: authToken, proxy: cookies.proxy, sec_ch_ua: cookies.sec_ch_ua, sec_ch_ua_mobile: cookies.sec_ch_ua_mobile, sec_ch_ua_platform: cookies.sec_ch_ua_platform, AcceptLanguage: cookies.AcceptLanguage, AcceptEncoding: cookies.AcceptEncoding};
}

module.exports = ActiveAccount;