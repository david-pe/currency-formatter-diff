const {
    formatCurrencyJava,
    formatCurrencyNode
} = require('./format-currency');

describe('Currency Formatting', () => {
    it('should format USD in en-US correctly', () => {
        const locale = 'en-US';
        const currency = 'USD';
        const value = 1234.56;

        const javaResult = formatCurrencyJava(locale, currency, value, true);
        const nodeResult = formatCurrencyNode(locale, currency, value);

        expect(javaResult).toBe(nodeResult);
    });

    it('should format EUR in de-DE correctly', () => {
        const locale = 'de-DE';
        const currency = 'EUR';
        const value = 1234.56;

        const javaResult = formatCurrencyJava(locale, currency, value, true);
        const nodeResult = formatCurrencyNode(locale, currency, value);

        expect(javaResult).toBe(nodeResult);
    });

    it('should format EUR in fr-FR correctly', () => {
        const locale = 'fr-FR';
        const currency = 'EUR';
        const value = 1234.56;

        const javaResult = formatCurrencyJava(locale, currency, value, true);
        const nodeResult = formatCurrencyNode(locale, currency, value);

        expect(javaResult).toBe(nodeResult);
    });

    it('should format a negative JPY value in ja-JP correctly', () => {
        const locale = 'ja-JP';
        const currency = 'JPY';
        const value = -5000;

        const javaResult = formatCurrencyJava(locale, currency, value, true);
        const nodeResult = formatCurrencyNode(locale, currency, value);

        expect(javaResult).toBe(nodeResult);
    });

    it('should format CAD in en-CA correctly', () => {
        const locale = 'en-CA';
        const currency = 'CAD';
        const value = 1234.56;

        const javaResult = formatCurrencyJava(locale, currency, value, true);
        const nodeResult = formatCurrencyNode(locale, currency, value);

        expect(javaResult).toBe(nodeResult);
    });

    it('should format INR in en-IN correctly', () => {
        const locale = 'en-IN';
        const currency = 'INR';
        const value = 1234567.89;

        const javaResult = formatCurrencyJava(locale, currency, value, true);
        const nodeResult = formatCurrencyNode(locale, currency, value);

        expect(javaResult).toBe(nodeResult);
    });

    it('should format BHD in ar-BH correctly (3 decimal places, RTL)', () => {
        const locale = 'ar-BH';
        const currency = 'BHD';
        const value = 1234.567;

        const javaResult = formatCurrencyJava(locale, currency, value, true);
        const nodeResult = formatCurrencyNode(locale, currency, value);

        expect(javaResult).toBe(nodeResult);
    });

    it('should handle negative ILS in he-IL correctly (RTL negative)', () => {
        const locale = 'he-IL';
        const currency = 'ILS';
        const value = -1234.56;

        const javaResult = formatCurrencyJava(locale, currency, value, true);
        const nodeResult = formatCurrencyNode(locale, currency, value);

        expect(javaResult).toBe(nodeResult);
    });

    it('should handle USD in a non-US locale (de-DE)', () => {
        const locale = 'de-DE';
        const currency = 'USD';
        const value = 1234.56;

        const javaResult = formatCurrencyJava(locale, currency, value, true);
        const nodeResult = formatCurrencyNode(locale, currency, value);

        expect(javaResult).toBe(nodeResult);
    });
}); 