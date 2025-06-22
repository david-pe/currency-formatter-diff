const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'comparison.html'));
});

let server;
if (require.main === module) {
    server = app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
        console.log('Open http://localhost:3000 to view the comparison.');
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