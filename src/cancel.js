

const axios = require('axios');

async function cancelBid(contractAddress, bid, account) {
    const body = {prices:[],contractAddress:""};
    body.prices.push(bid.prices);
    body.contractAddress = contractAddress;

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


  return await axios.post('https://core-api.prod.blur.io/v1/collection-bids/cancel', body, {headers: headers}).then(res=> {
    return res.data
  });
}


module.exports = {cancelBid}