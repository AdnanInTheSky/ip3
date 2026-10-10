const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Handle clean URLs and specific rewrites
app.use((req, res, next) => {
    const reqPath = req.path;

    // Normalise approach alias
    if (reqPath === '/approach') {
        return res.sendFile(path.join(__dirname, 'approch.html'));
    }

    // Check if an .html file exists for routes without extension
    if (reqPath !== '/' && !path.extname(reqPath)) {
        const htmlPath = path.join(__dirname, `${reqPath}.html`);
        if (fs.existsSync(htmlPath)) {
            return res.sendFile(htmlPath);
        }
    }

    next();
});

// Serve static assets from project root
app.use(express.static(__dirname, {
    extensions: ['html', 'htm']
}));

// Route fallback: if route not found, serve index.html
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
    console.log(`IP3 Consulting dev server running at http://${HOST}:${PORT}`);
});
