// This script is run in its own Node.js process to isolate it from Jest
const puppeteer = require('puppeteer');

async function run() {
    const [locale, currency, valueStr] = process.argv.slice(2);
    const value = parseFloat(valueStr);

    const browser = await puppeteer.launch({
        executablePath: puppeteer.executablePath(),
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const result = await page.evaluate((l, c, v) => {
        return new Intl.NumberFormat(l, {
            style: 'currency',
            currency: c,
            currencyDisplay: 'symbol'
        }).format(v);
    }, locale, currency, value);
    await browser.close();
    
    // Print the result to stdout so the test can capture it
    process.stdout.write(result);
}

run(); 