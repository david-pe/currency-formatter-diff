# Wix Currency and Locale Formatter Comparison

> [!IMPORTANT]
> **Better than running it yourself, [check out the generated output here](https://david-pe.github.io/currency-formatter-diff/).**
>
> The process to generate the comparison data is very time-consuming. It is highly recommended to view the pre-built static output linked above.

This project provides a web-based tool to compare currency and locale formatting between Node.js and Chromium, using data fetched from Wix APIs.

## Project Structure

The `public` directory contains the front-end application files:

```
public/
├── index.html
├── main.js
├── sse-worker.js
└── styles.css
```

The application fetches currency and locale data, which is stored in:

- `wix-currencies.json`
- `wix-locales.json`

The server-side logic is in `server.js`, and the formatting logic is handled by `format-currency.js`.