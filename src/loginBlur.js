
const axios = require('axios');

async function loginBlur(sigObj, headers, agent) {
    const res = await axios.post('https://core-api.prod.blur.io/auth/login', sigObj, {headers: headers, httpsAgent: agent})
    return res.data;

 

}

module.exports = {loginBlur};