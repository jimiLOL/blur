
const axios = require('axios');


const walSignature = null;

async function getBlurSign(cookies) {

    if (cookies.length == 0) {
        console.log('!_No cookies_!');
        return null
    };
    console.log('cookies.length ' + cookies.length);

    let cook_str = '';

    cookies.forEach(element => {
        let sub_srt = element.name + '=' + element.value + ';'
        cook_str = cook_str.concat(sub_srt)

    });
    console.log('cookies ' + cook_str);
    const headers = {
        'Host': 'core-api.prod.blur.io',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/110.0',
        'Accept': '*/*',
        'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://blur.io/',
        'Content-Type': 'application/json',
        'Origin': 'https://blur.io',
        'Connection': 'keep-alive',
        'Cookie': cook_str,
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site'

    };
    const body = { "walletAddress": "0xb8F202dC3242A6b17d7Be5e2956aC2680EAf223c" };


    return await axios.post('https://core-api.prod.blur.io/auth/challenge', body, { headers: headers }).then(res => {
        // console.log(res.data);
        return { data: res.data, headers: headers };
    }).catch(err => {
        console.log(err.message);
    })

}

module.exports = { getBlurSign };