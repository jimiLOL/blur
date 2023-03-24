
const axios = require('axios')


const getFromData = async (body, account) => {

    const headers = {
        'Host': 'core-api.prod.blur.io',
        'User-Agent': account.UserAgent,
        'Accept': '*/*',
        'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
        'sec-ch-ua-platform':'"Windows"',
        'Accept-Language': 'en-US,en;q=0.9',
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
        // console.log(res.data);
        return res.data
    }).catch(e=> {
        console.log(e.message);
        if (e?.response?.data) {
            return e.response.data
        }
        return null
    })

}

module.exports = {getFromData}