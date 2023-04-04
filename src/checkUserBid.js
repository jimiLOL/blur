const { newCookies } = require('./getSession');

const axios = require('axios');
// await fetch("https://core-api.prod.blur.io/v1/collection-bids/user/0xb8f202dc3242a6b17d7be5e2956ac2680eaf223c?filters=%7B%7D", {
//     "credentials": "include",
//     "headers": {
//         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/111.0",
//         "Accept": "*/*",
//         "Accept-Language": "ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3",
//         "Sec-Fetch-Dest": "empty",
//         "Sec-Fetch-Mode": "cors",
//         "Sec-Fetch-Site": "same-site"
//     },
//     "referrer": "https://blur.io/",
//     "method": "GET",
//     "mode": "cors"
// });


const checkUserBid = async (account) => {
    // const accountAvailable = await newCookies();
    // // console.log(accountAvailable);
    // const account = accountAvailable[0];

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

    return await axios.get(`https://core-api.prod.blur.io/v1/collection-bids/user/${account.walletAddress.toLocaleLowerCase()}?filters=%7B%7D`, {headers: headers}).then(res=> {
        console.log(res.data);
        return res.data;
    }).catch(e=> {
        console.log(e);
    })

}

module.exports = {checkUserBid}