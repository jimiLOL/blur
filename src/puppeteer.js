const puppeteer = require('puppeteer');
const path = require('path');
const PATH_TO_EXTENSION = path.resolve(__dirname + './../mm_10.2.2');
console.log(PATH_TO_EXTENSION);
const EXTENSION_ID = 'eonnpjflohbapanoebejjdjfpjiendej';

async function getExtensionID(browser) {

    const page = await browser.newPage();

    await page.goto('chrome://extensions');
    await page.waitForTimeout(4500);

    const ele = await page.$eval('extensions-manager');
    console.log(ele);
    

    const extensionItem = await page.evaluate(() => {
        const selector = document.querySelector('extensions-manager');
        return selector
      const items = [...document.querySelectorAll('.enabled')];
      return items
      return items.find(e => e.getAttribute('enabled') && !e.querySelector('[class^="button"][class*="manage"]')) || null;
    });
    console.log(extensionItem);
    // await page.close();
    // return extensionItem ? extensionItem.getAttribute('id') : null;
  }
  

const getExtensionId = async (browser) => {
    const extensionTarget = await browser.waitForTarget(target => {
        if (target) {
            return target.type() === 'background_page';

        }
    });
    // const targets = await browser.targets();

    // const extensionTarget2 = targets.find(({ _targetInfo }) => {
    //     console.log(_targetInfo);
    //     if (_targetInfo) {
    //         // Extension background page
    //         return _targetInfo.title === 'Metamask' && _targetInfo.type === 'background_page';
    //     }
    //     // return _targetInfo.title === 'Metamask' && _targetInfo.type === 'background_page';
    // });
    console.log(extensionTarget);
    const cdpsession = await extensionTarget.createCDPSession();
    const { url } = await cdpsession.send('Runtime.evaluate', {
        expression: `chrome.runtime.getURL('')`,
        returnByValue: true
    });
    console.log('Extension URL:', url);

    // const extensionUrl = extensionTarget._targetInfo.url || '';
    // console.log('extensionUrl ' + extensionUrl);
    // const [, , extensionID] = extensionUrl.split('/');

    // return extensionID;

}

function puppeteerStart(body, port) {
    return new Promise(async (resolve, reject) => {
        // const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] }); // linux
        const browser = await puppeteer.launch({
            headless: false,
            args: [
                `--disable-extensions-except=${PATH_TO_EXTENSION}`,
                `--load-extension=${PATH_TO_EXTENSION}`,
                
            ]
        }); // windows
        // const extensionId = await getExtensionId(browser);
        console.log(await getExtensionID(browser));

        // const page = await browser.newPage();
        // page.on('request', request => {
        //     console.log('Request URL:', request.url());
        //     console.log('Request headers:', request.headers());
        // });

        // await page.goto('https://blur.io/collection');
        // await page.setViewport({ width: 1080, height: 1024 });
        // await page.screenshot({ path: 'example.png' });

        // await page.$('button');

        // await page.waitForTimeout(1500);


        // const cookies = await page.cookies();




        // resolve(cookies)




    })


}

module.exports = { puppeteerStart };