const {
    formatCurrencyNode,
    formatCurrencyChromium
} = require('./format-currency');

describe('Node.js vs. Chromium ICU Comparison', () => {
    it('should format USD in en-US consistently', () => {
        const locale = 'en-US';
        const currency = 'USD';
        const value = 1234.56;

        const nodeResult = formatCurrencyNode(locale, currency, value);
        const chromiumResult = formatCurrencyChromium(locale, currency, value);

        expect(nodeResult).toBe(chromiumResult);
    });
}); 