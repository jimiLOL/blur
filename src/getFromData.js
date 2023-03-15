
const axios = require('axios')


const getFromData = async (body, account) => {

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
        'Cookie': account.cook_str,
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site'

    };

    return await axios.post('https://core-api.prod.blur.io/v1/collection-bids/format', body, {headers: headers}).then(res=> {
        console.log(res.data);
        return res.data
    }).catch(e=> {
        console.log(e);
        return null
    })

}

module.exports = {getFromData}