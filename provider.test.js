const { formatCurrencyJava } = require('./format-currency');

describe('Java Locale Provider Verification', () => {
    it('should produce different results for Serbian Dinar with and without the CLDR flag', () => {
        const locale = 'sr-RS';
        const currency = 'RSD';
        const value = 1234.56;

        // Format with the CLDR provider
        const cldrResult = formatCurrencyJava(locale, currency, value, true);

        // Format with the legacy COMPAT provider
        const compatResult = formatCurrencyJava(locale, currency, value, false);

        console.log(`CLDR provider output for sr-RS: ${cldrResult}`);
        console.log(`Legacy provider output for sr-RS: ${compatResult}`);

        // This assertion proves the flag is causing a change in output
        expect(cldrResult).not.toBe(compatResult);
    });
}); 