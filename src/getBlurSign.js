
const axios = require('axios');


const walSignature = null;

async function getBlurSign() {

    const headers = {
        'Host':'core-api.prod.blur.io',
        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/110.0',
        'Accept':'*/*',
        'Accept-Language':'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding':'gzip, deflate, br',
        'Referer':'https://blur.io/',
        'Content-Type':'application/json',
        'Origin':'https://blur.io',
        'Connection':'keep-alive',
        'Cookie':'authToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiMHhiOGYyMDJkYzMyNDJhNmIxN2Q3YmU1ZTI5NTZhYzI2ODBlYWYyMjNjIiwic2lnbmF0dXJlIjoiMHgxMWQwZmU3ZjZiMTg1MWZiYjZkMzM5N2E4NTUxYjM3MGM5M2I3NmFlMzhmNmE2NDc5NjllYTY5NTY3ZWZlZTM3MTkyNjk3ZTA2MjZmMGQ0ZWU2OTg1NTI2MDkxZTM3MGMzNzlhNzc3Y2Q5NTg2ZWZiZTg4NzZkMDg1Y2ZkZTY0ODFiIiwiaWF0IjoxNjc4NjMwNzQzLCJleHAiOjE2ODEyMjI3NDN9.QfMhwtVYlRQL5wWUoaMATPcjbLnoN6N4r8kBZc15as4; walletAddress=0xb8f202dc3242a6b17d7be5e2956ac2680eaf223c; rl_session=RudderEncrypt%3AU2FsdGVkX18x78ZtRxouIwtiKxnDZL%2BVN4kNIeAnJDCT5KelfSJmnjc5%2B7HPlo1iR0gzIaS92%2BopDmj4MKjlQIfVuLVWooNNNmec5zZWioIOSBdtnLM0MOVZwqOqcS9i5Nsd0KfLINfhZZrxvj44eg%3D%3D; rl_user_id=RudderEncrypt%3AU2FsdGVkX1%2BPQy4Vm%2BgZY8PL8QFMHFe%2FcWlC0uRfnsFJA1sO9NvJcwIqkYDJflhCK7n%2B4miIj6errIeMm7VZEw%3D%3D; rl_trait=RudderEncrypt%3AU2FsdGVkX1%2BagFy4WJmzdesTmJ1GZ3b10GZaZR6p5UI%3D; rl_group_id=RudderEncrypt%3AU2FsdGVkX1%2Bci8IELMqj%2B5ZQyWfvVQ%2FK%2FgBWYr72qPA%3D; rl_group_trait=RudderEncrypt%3AU2FsdGVkX19RXMATokhI1dM%2Fm%2Fb%2BWB0sJUyQsrwVu%2F4%3D; rl_anonymous_id=RudderEncrypt%3AU2FsdGVkX1%2BRZJ1jv%2BoSmFysXAGmx3a2WbMSEICVS15RktofFehmcGGUgnlL7whAOAvftOPyEhenacfzwVsW0g%3D%3D; rl_page_init_referrer=RudderEncrypt%3AU2FsdGVkX19XvegVq7ZUn9Onn%2FaLq0gZLsJQb6eunLU%3D; rl_page_init_referring_domain=RudderEncrypt%3AU2FsdGVkX19k%2BmpftTsNCYtLMtyhGu9ZnY4afLE0z3o%3D; __cf_bm=uxPqN7AHMWgcYCfL8uQo7uKWoXhI79FNWZvBfp77f4s-1678631253-0-AXC0J+mdMCTAcQvbbbuagpwP5+ZnuYafBjeiODcIpcTRU6V+j50VZfZhRAy7A3uHnHyY6T3ljBP7J7W3MER1eCvZdg1VEtqbOqJM0uAM1TEq; fs_uid=#o-19FFTT-na1#5434589884829696:5182663578472448:::#b189122c#/1710167252; cf_clearance=rgSCr35Xkmyen2D4ma34UT9dJ7B3zBLIF7U.cYOD0tE-1678631285-0-250',
        'Sec-Fetch-Dest':'empty',
        'Sec-Fetch-Mode':'cors',
        'Sec-Fetch-Site':'same-site'
        
    };
    const body = {"walletAddress":"0xb8F202dC3242A6b17d7Be5e2956aC2680EAf223c"};


   return await axios.post('https://core-api.prod.blur.io/auth/challenge', body, {headers: headers}).then(res=> {
        // console.log(res.data);
        return {data: res.data, headers: headers};
    }).catch(err => {
        console.log(err.message);
    })

}

module.exports = {getBlurSign};