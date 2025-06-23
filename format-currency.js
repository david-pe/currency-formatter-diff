const { execSync } = require('child_process');
const { getBrowserFormat } = require('./browser-format');

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

async function formatCurrencyPlaywright(browserName, locale, currency, value) {
    try {
        return await getBrowserFormat(browserName, locale, currency, value);
    } catch (error) {
        console.error(`Playwright formatting failed for ${browserName}:`, error);
        return 'ERROR';
    }
}

module.exports = { formatCurrencyJava, formatCurrencyNode, formatCurrencyPlaywright };
