# Wix Currency and Locale Formatter Comparison

This project provides a static HTML file to compare currency and locale formatting between Java (Legacy), Java (CLDR), Node.js (ICU), and Browser (ICU).

## Viewing the Comparison

To view the comparison, you need a simple web server.

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Start the server:**
    ```bash
    node server.js
    ```

3.  Open your browser and navigate to `http://localhost:3000`.

The file `comparison.html` is a large, self-contained file with all the comparison data.

**Note:** The process to generate this HTML file is very time-consuming. It is recommended to use the pre-built `comparison.html` directly. 