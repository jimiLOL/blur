
const axios = require('axios');


const walSignature = null;

async function getBlurSign(account) {

    if (account.cook_str.length == 0) {
        console.log('!_No cookies_!');
        return null
    };
    console.log('cookies.length ' + account.cook_str.length);

    // let cook_str = '';

    // cookies.forEach(element => {
    //     let sub_srt = element.name + '=' + element.value + ';'
    //     cook_str = cook_str.concat(sub_srt)

    // });
    // console.log('cookies ' + cook_str);
    const headers = {
        'Host': 'core-api.prod.blur.io',
        'User-Agent': account.UserAgent,
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip',
        'Referer': 'https://blur.io/',
        'Content-Type': 'application/json',
        'Origin': 'https://blur.io',
        'Connection': 'keep-alive',
        'Cookie': account.cook_str,
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site'

    };
    console.log(headers);
    const body = { walletAddress: account.walletAddress };


    return await axios.post('https://core-api.prod.blur.io/auth/challenge', body, { headers: headers }).then(res => {
        // console.log(res);
        return { data: res.data, headers: headers };
    }).catch(err => {
        console.log(err.message);
        // console.log(err);
    })

}

module.exports = { getBlurSign };