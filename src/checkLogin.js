
const axios = require('axios');

const helper = require('./helper');
const walSignature = null;

async function checkLogin(account) {


    if (account.cook_str.length == 0) {
        console.log('!_No cookies_!');
        return null
    };
    console.log('cookies.length ' + account.cook_str.length);

    if (!account.authToken) {
        return null

    }
    const { host: proxyHost, port: portHost, proxyAuth: proxyAuth } = helper.proxyInit(account.proxy);

    let proxyOptions = {
        host: proxyHost,
        port: portHost,
        proxyAuth: proxyAuth,
        headers: {
            'User-Agent': account.UserAgent
        },
    };
 
 

    // let cook_str = '';

    // cookies.forEach(element => {
    //     let sub_srt = element.name + '=' + element.value + ';'
    //     cook_str = cook_str.concat(sub_srt)

    // });
    // console.log('cookies ' + cook_str);
    const headers = {
        'Accept': '*/*',
        'User-Agent': account.UserAgent,
        'Origin': 'https://blur.io',
        'sec-ch-ua': account.sec_ch_ua,
        'sec-ch-ua-platform':account.sec_ch_ua_platform,
        'Accept-Language': account.AcceptLanguage,
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://blur.io/',
        'Content-Type': 'application/json',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'Cookie': account.cook_str,

    };
    console.log(headers);
    const body = { authToken: account.authToken };


    return await axios.post('https://core-api.prod.blur.io/auth/cookie', body, { headers: headers, httpsAgent: helper.initAgent(proxyOptions) }).then(res => {
        // console.log(res);
        return { data: res.data, headers: headers };
    }).catch(err => {
        console.log('При проверке cookie произошла ошибка ' + err.message);
        // console.log(err);
        return null
    })

}

module.exports = { checkLogin };