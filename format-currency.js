const { execSync } = require('child_process');
const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

chromium.setHeadlessMode = true;

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

function formatCurrencyNode(locale, currency, value) {
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            currencyDisplay: 'symbol'
        }).format(value);
    } catch (e) {
        return 'ERROR';
    }
}

async function formatCurrencySparticuz(page, locale, currency, value) {
    try {
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
    }
}

module.exports = { formatCurrencyJava, formatCurrencyNode, formatCurrencySparticuz };
