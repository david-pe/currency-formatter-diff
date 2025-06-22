const { execSync } = require('child_process');

function formatCurrencyJava(locale, currency, value, useCldr) {
    try {
        const cldrFlag = useCldr ? '-Djava.locale.providers=CLDR,SPI' : '';
        const command = `java ${cldrFlag} FormatCurrency ${locale} ${currency} ${value}`;
        return execSync(command, { encoding: 'utf-8' }).trim();
    } catch (e) {
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

module.exports = { formatCurrencyJava, formatCurrencyNode }; 