const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'wix-locales.json');
const outputFile = path.join(__dirname, 'wix-locales.json');

try {
    // Read the existing locales which is an array of strings
    const localeIds = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

    // Create a map of id: displayName
    const localeMap = localeIds.reduce((acc, localeId) => {
        if (!localeId || typeof localeId !== 'string') {
            return acc;
        }
        try {
            // Generate display name for the locale
            const displayName = new Intl.DisplayNames(['en'], { type: 'language' }).of(localeId);
            acc[localeId] = displayName;
        } catch (e) {
            // If DisplayNames fails (e.g., for non-standard codes), use the ID itself.
            acc[localeId] = localeId;
        }
        return acc;
    }, {});

    // Write the new map back to the file
    fs.writeFileSync(outputFile, JSON.stringify(localeMap, null, 2));
    console.log('Successfully transformed wix-locales.json to the correct format.');

} catch (e) {
    console.error('Failed to transform wix-locales.json:', e);
} 