const { chromium, firefox, webkit } = require('playwright');

const browserMap = {
    chromium,
    firefox,
    webkit,
};

async function getBrowserFormat(browserName, locale, currency, value) {
    const browserType = browserMap[browserName.toLowerCase()];
    if (!browserType) {
        throw new Error(`Unsupported browser: ${browserName}`);
    }

    const browser = await browserType.launch();
    const page = await browser.newPage();

    try {
        return await page.evaluate(({ l, c, v }) => {
            return new Intl.NumberFormat(l, {
                style: 'currency',
                currency: c,
                currencyDisplay: 'symbol',
            }).format(v);
        }, { l: locale, c: currency, v: value });
    } finally {
        await browser.close();
    }
}

module.exports = { getBrowserFormat }; 