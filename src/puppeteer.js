const puppeteer = require('puppeteer');
const path = require('path');

const helper = require('./helper');
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

const check_captcha = (page) => {
    return new Promise(async (resolve, reject) => {
        let captcha = null;
        // await page.waitForSelector('iframe');
        while (!captcha) {
            const iframe = await page.$('iframe');
            console.log(iframe);
            if (iframe) {
                const frameContent = await iframe.contentFrame();
                const captchaEle = await frameContent.$('input[type="checkbox"]');
                if (captchaEle) {
                    console.log('captcha');
                    await captchaEle.click()
                    resolve(true);
                } 
            }
           
            await helper.timeout(500);

        }
       
    })

}

const metamask_init = async (browser) => {
    const pages = await browser.pages();
    let id_metamask;

    for (const [i, page] of pages.entries()) {
        const title = await page.title();
        console.log(title);
        const url = await page.url();
        console.log(url);
        if (title == 'MetaMask') {
            id_metamask = { url: url, title: title, id: url.split('/')[2], page: i };
            break;
        }
    }
    if (!id_metamask) {
        return await metamask_init(pages)
    } else {
        return id_metamask

    }
};
const metaMask_await = async (browser) => {
    let extensionPageTarget = null;
    while (!extensionPageTarget) {
        const targets = await browser.targets();
        extensionPageTarget = targets.find(t => t.url().startsWith('chrome-extension://'));
        await helper.timeout(500);
    }
    return extensionPageTarget
}

function puppeteerStart(body, port) {
    return new Promise(async (resolve, reject) => {
        // const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] }); // linux
        const browser = await puppeteer.launch({
            headless: false,
            args: [
                `--proxy-server=http://localhost:8866`,
                `--disable-extensions-except=${PATH_TO_EXTENSION}`,
                `--load-extension=${PATH_TO_EXTENSION}`,

            ]
        }); // windows
        // const extensionId = await getExtensionId(browser);
        // console.log(await getExtensionID(browser));
        await helper.timeout(4000);
        let id_metamask;
        let pages = await browser.pages();

        id_metamask = await metamask_init(browser);
        if (!id_metamask) {
            await browser.close();
            return reject('Metamask not found');
        }
        pages = await browser.pages();

    

        
        console.log(id_metamask);
        const pageToSwitch = pages[id_metamask.page];
        await pageToSwitch.bringToFront();
        // await pageToSwitch.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36');

        const welcome = await pageToSwitch.$('.welcome-page__header');
        console.log(welcome);
        await pageToSwitch.waitForSelector('button');
        await pageToSwitch.click('button'); // кликаем на кнопку "Get Started"
        await pageToSwitch.waitForSelector('.button.btn--rounded.btn-primary.page-container__footer-button'); // ждем кнопку "Create a Wallet"
        await pageToSwitch.click('.button.btn--rounded.btn-primary.page-container__footer-button'); // кликаем на кнопку "Create a Wallet"
        await pageToSwitch.waitForSelector('.button.btn--rounded.btn-primary.first-time-flow__button'); // ждем кнопку "import a Wallet"
        await pageToSwitch.click('.button.btn--rounded.btn-primary.first-time-flow__button'); // кликаем на кнопку "import a Wallet"
        let str_sid = 'cram caution tiny ski seminar bronze modify near skull demise round outside'

        const walletSid = str_sid.split(' ');
        await pageToSwitch.waitForSelector('form.create-new-vault__form')
        const inputElements = await pageToSwitch.$$('form.create-new-vault__form > div.import-srp__container > div.import-srp__srp > div.import-srp__srp-word');
        // console.log(inputElements);
        for (const [i, input] of inputElements.entries()) {
            const in_form = await input.$(`.MuiInputBase-input.MuiInput-input`);
            // console.log(walletSid[i]);
            if (in_form) {
                // console.log(in_form);
                await in_form.type(walletSid[i]);
            } else {
                break
            }

        }
        const input_password = await pageToSwitch.$$('form.create-new-vault__form > div.create-new-vault__create-password > div.MuiFormControl-root.MuiTextField-root.MuiFormControl-marginNormal');
        // console.log(input_password);
        // input_password.type('test');
        for (const [i, input] of input_password.entries()) {
            const in_form = await input.$(`.MuiInputBase-input.MuiInput-input`);
            // console.log(walletSid[i]);
            if (in_form) {
                // console.log(in_form);
                await in_form.type('4KHqKYaVzSLrRN8');
            } else {
                break
            }

        }
        const check_terms = await pageToSwitch.$('div.create-new-vault__terms > input');
        console.log(check_terms);
        await check_terms.click();
        const button = await pageToSwitch.$('button.btn--rounded.btn-primary.create-new-vault__submit-button');
        await button.click();
        await pageToSwitch.waitForNavigation({ waitUntil: 'domcontentloaded' });
        const btn = await pageToSwitch.$('button'); // конпка "All Done"
        await btn.click();
        // pageToSwitch.on('request', request => {
        //     if (request.url().includes('core-api.prod.blur.io')) {
        //         console.log('Request URL:', request.url());
        //         console.log('Request headers:', request.headers());
        //     }
        //     // console.log('Request URL:', request.url());
        //     // console.log('Request headers:', request.headers());
        // });
        await pageToSwitch.goto('https://blur.io/collection');
        // await pageToSwitch.waitForNavigation({ waitUntil: 'domcontentloaded' });
        console.log('Ждем кнопку "connect wallet"');
        await pageToSwitch.waitForSelector('button');
        console.log('Кликаем на кнопку "connect wallet"');
        await pageToSwitch.click('button'); // кликаем на кнопку "connect wallet"
        await pageToSwitch.waitForSelector('#METAMASK');
        await pageToSwitch.click('#METAMASK'); // кликаем на кнопку "connect wallet Metamask"

        // await helper.timeout(3000);
        await pageToSwitch.goto(id_metamask.url)

        // const targets = await browser.targets();
        // const extensionPageTarget = targets.find(t => t.url().startsWith('chrome-extension://'));

        // // получаем доступ к странице расширения
        // const extensionPage = await extensionPageTarget.page();
        // extensionPage.bringToFront();
        // console.log('extensionPage');
        await pageToSwitch.waitForSelector('#app-content');
        // const wrapper = await extensionPage.$('div.main-container-wrapper > div.permissions-connect');
        // console.log(wrapper);
        let but_next = await pageToSwitch.$('button.button.btn--rounded.btn-primary');
        console.log(but_next);
        if (but_next) {
            await but_next.click(); // кликаем на кнопку "Next"
            but_next = await pageToSwitch.$('button.button.btn--rounded.btn-primary');

            await but_next.click(); // кликаем на кнопку "Connect"

        }
        await helper.timeout(500);
        // await pageToSwitch.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36');
        await pageToSwitch.setViewport({ width: 1080, height: 1024 });


        await pageToSwitch.goto('https://blur.io/collection');
        console.log('Ждем кнопку "connect wallet"');
        await pageToSwitch.waitForSelector('button');
        console.log('Кликаем на кнопку "connect wallet"');
        await pageToSwitch.click('button'); // кликаем на кнопку "connect wallet"
        await pageToSwitch.waitForSelector('#METAMASK');
        await pageToSwitch.click('#METAMASK'); // кликаем на кнопку "connect wallet Metamask"

        await metaMask_await(browser)

        await helper.timeout(2500); // ждем появление запроса на подпись

        await check_captcha(pageToSwitch);
        

        

          
        const page = await browser.newPage();

        await page.goto(id_metamask.url)
        await page.waitForSelector('#app-content');
          but_next = await page.$('button.button.btn--rounded.btn-primary.btn--large.request-signature__footer__sign-button');
          console.log(but_next);
        //   await but_next.click(); // кликаем на кнопку "Sign"
        await helper.timeout(1000);  

        // await pageToSwitch.goto('https://blur.io/collection');










        // const pagess = await browser.pages();


        // for (const [i, page] of pagess.entries()) {
        //     const title = await page.title();
        //     console.log(title);
        //     const url = await page.url();
        //     console.log(url);
        //     if (title == 'MetaMask') {
        //         id_metamask = { url: url, title: title, id: url.split('/')[2], page: i };
        //         break;
        //     }
        // }
        // const metaMask = pages[id_metamask.page];
        // await metaMask.bringToFront();
        // await metaMask.waitForSelector('button.button.btn--rounded btn-primary');
        // await metaMask.click('button.button.btn--rounded btn-primary'); // кликаем на кнопку "Next"





        // walletSid.forEach(async (element, i) => {
        //     const input = await pageToSwitch.$(`import-srp__srp-word-${i}`);
        //     await input.type(element);


        // });






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