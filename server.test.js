const request = require('supertest');
const app = require('./server');
const fs = require('fs');
const path = require('path');

// Mock the format-currency module
jest.mock('./format-currency', () => ({
    formatCurrencyJava: jest.fn(),
    formatCurrencyNode: jest.fn(),
}));

describe('Server API', () => {
    let server;
    beforeAll((done) => {
        server = app.listen(0, done); // Listen on a random free port
    });

    afterAll((done) => {
        server.close(done);
    });

    it('should return a filtered list of locales supported by Node.js', async () => {
        const response = await request(server).get('/api/meta');
        expect(response.status).toBe(200);

        const { locales } = response.body;

        const rawLocalesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'locale-list/data/en/locales.json'), 'utf8'));
        const allLocales = Object.keys(rawLocalesData).map(l => l.replace(/_/g, '-'));
        
        // This is the core of the test. We expect the server to return fewer locales than exist in the source file.
        expect(locales.length).toBeLessThan(allLocales.length);
        expect(locales.length).toBeGreaterThan(0);

        // And that all returned locales are actually supported.
        const supportedLocales = new Set(Intl.NumberFormat.supportedLocalesOf(allLocales));
        const expectedLocales = allLocales.filter(locale => supportedLocales.has(locale));
        
        const sortedExpectedLocales = expectedLocales.sort((a, b) => a.localeCompare(b));
        const sortedReceivedLocales = [...locales].sort((a, b) => a.localeCompare(b));

        expect(sortedReceivedLocales).toEqual(sortedExpectedLocales);
    });
}); 