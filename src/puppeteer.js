const puppeteer = require('puppeteer');




function puppeteerStart(body, port) {
    return new Promise(async (resolve, reject) => {
        // const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] }); // linux
        const browser = await puppeteer.launch(); // windows
        const page = await browser.newPage();
        page.on('request', request => {
            console.log('Request URL:', request.url());
            console.log('Request headers:', request.headers());
        });

        await page.goto('https://blur.io/collection');
        await page.setViewport({ width: 1080, height: 1024 });
        await page.screenshot({ path: 'example.png' });

        await page.$('button');

        await page.waitForTimeout(1500);


        const cookies = await page.cookies();




        resolve(cookies)




    })


}

module.exports = { puppeteerStart };