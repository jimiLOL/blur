const { default: axios } = require("axios")

const getFloorItems = async (contractAddress, account) => {
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
    return await axios.get(`https://core-api.prod.blur.io/v1/charts/everything?collectionId=${contractAddress}&spanMs=86400000&intervalMs=300000`, { headers: headers }).then(res => {
        console.log('getFloorItems ' + new Date());
        return { data: res.data, statusCode: res.status };
    }).catch(err => {
        console.log(err.message);
        console.log(err?.response?.data);
        return { statusCode: 400, data: null }
    })
}

module.exports = getFloorItems