const express = require('express');
const path = require('path');
const fs = require('fs');
const { Worker } = require('worker_threads');
const os = require('os');

const app = express();
const port = 3000;
const COMPARISON_VALUE = 1234567.899;

const dominantCurrencies = [
    'USD', 'EUR', 'JPY', 'GBP', 'CNY', 'AUD', 'CAD', 'CHF', 'HKD', 'SGD', 
    'SEK', 'KRW', 'NOK', 'NZD', 'INR', 'MXN', 'TWD', 'ZAR', 'BRL', 'DKK'
];

const dominantLanguageCodes = [
    'en', 'zh', 'hi', 'es', 'fr', 'ar', 'bn', 'ru', 'pt', 'ur', 
    'id', 'de', 'ja', 'pa', 'vi', 'tr', 'ko', 'it'
];

const localeNames = JSON.parse(fs.readFileSync(path.join(__dirname, 'wix-locales.json'), 'utf8'));
const currencyNames = JSON.parse(fs.readFileSync(path.join(__dirname, 'wix-currencies.json'), 'utf8'));

const allLocales = Object.keys(localeNames);

function getValidLocales(locales) {
    const validLocales = [];
    for (const locale of locales) {
        try {
            new Intl.Locale(locale);
            validLocales.push(locale);
        } catch (e) {
            // Invalid locale tag
        }
    }
    return validLocales;
}

function detectBrowser(userAgent) {
    if (!userAgent) return 'chromium';
    const ua = userAgent.toLowerCase();
    if (ua.includes('firefox')) return 'firefox';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'webkit';
    return 'chromium';
}

const allCurrencies = Object.keys(currencyNames);

const sortWithDominance = (arr, dominanceList, keyExtractor = (item => item)) => {
    return [...arr].sort((a, b) => {
        const keyA = keyExtractor(a);
        const keyB = keyExtractor(b);
        const indexA = dominanceList.indexOf(keyA);
        const indexB = dominanceList.indexOf(keyB);

        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return keyA.localeCompare(keyB);
    });
};

const sortedLocales = sortWithDominance(getValidLocales(allLocales), dominantLanguageCodes, locale => locale.split('-')[0]);
const sortedCurrencies = sortWithDominance(allCurrencies, dominantCurrencies);

app.get('/api/meta', (req, res) => {
    res.json({
        locales: sortedLocales,
        currencies: sortedCurrencies,
        localeNames,
        currencyNames
    });
});

app.get('/api/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const userAgent = req.headers['user-agent'];
    const detectedBrowser = detectBrowser(userAgent);

    const currencies = [...sortedCurrencies];
    const numWorkers = Math.min(os.cpus().length, currencies.length);
    let finishedWorkers = 0;

    const startWorker = (currency) => {
        const worker = new Worker(path.resolve(__dirname, 'worker.js'), {
            workerData: {
                currency,
                locales: sortedLocales,
                value: COMPARISON_VALUE,
                browserName: detectedBrowser,
            },
        });

        worker.on('message', (cellData) => {
            res.write(`data: ${JSON.stringify(cellData)}\n\n`);
        });

        worker.on('error', (error) => {
            console.error(`Worker for ${currency} failed:`, error);
        });

        worker.on('exit', () => {
            if (currencies.length > 0) {
                startWorker(currencies.shift());
            } else {
                finishedWorkers++;
                if (finishedWorkers === numWorkers) {
                    res.write('event: end\ndata: {}\n\n');
                    res.end();
                }
            }
        });
    };

    if (currencies.length === 0) {
        res.write('event: end\ndata: {}\n\n');
        res.end();
        return;
    }
    
    // Start up the workers
    for (let i = 0; i < numWorkers; i++) {
        startWorker(currencies.shift());
    }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let server;
if (require.main === module) {
    server = app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
    });
}

process.on('SIGINT', () => {
    if (server) {
        server.close(() => {
            console.log('Server closed.');
            process.exit(0);
        });
    }
});

module.exports = app; 