const { execSync } = require('child_process');
const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

chromium.setHeadlessMode = true;

const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

chromium.setHeadlessMode = true;





async function formatCurrencySparticuz(locale, currency, value) {
    let browser;
    try {
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });

        const page = await browser.newPage();
        const result = await page.evaluate((l, c, v) => {
            return new Intl.NumberFormat(l, {
                style: 'currency',
                currency: c,
                currencyDisplay: 'symbol'
            }).format(v);
        }, locale, currency, value);
        return result;
    } catch (error) {
        console.error('Sparticuz/Puppeteer formatting failed:', error);
        return 'ERROR';
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}



async function formatCurrencySparticuz(locale, currency, value) {
    let browser;
    try {
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });

        const page = await browser.newPage();
        const result = await page.evaluate((l, c, v) => {
            return new Intl.NumberFormat(l, {
                style: 'currency',
                currency: c,
                currencyDisplay: 'symbol'
            }).format(v);
        }, locale, currency, value);
        return result;
    } catch (error) {
        console.error('Sparticuz/Puppeteer formatting failed:', error);
        return 'ERROR';
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

function formatCurrencyJava(locale, currency, value, useCldr) {
    try {
        const cldrFlag = useCldr ? '-Djava.locale.providers=CLDR,SPI' : '-Djava.locale.providers=COMPAT,SPI';
        const command = `java ${cldrFlag} FormatCurrency ${locale} ${currency} ${value}`;
        return execSync(command, { encoding: 'utf-8' }).trim();
    } catch (e) {
        console.error('Java formatting failed:', e);
        return 'ERROR';
    }
}

module.exports = { formatCurrencyJava, formatCurrencyNode, formatCurrencySparticuz };
