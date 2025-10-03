const express = require('express');
const router = express.Router();
require('dotenv').config();

// Middleware global para /products
router.use(express.json()); // garante que req.body seja parseado

router.use((req, res, next) => {
    const start = Date.now();
    console.log(`[REQ] ${req.method} ${req.originalUrl} - IP: ${req.ip} - PORT: ${req.socket.localPort}`);

    // 1. Verifica API Key
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.API_KEY) {
        return res.status(403).json({ message: 'API Key inválida' });
    }
    if (!apiKey) {
        return res.status(401).json({ message: 'API Key é obrigatória' });
    } else {
        req.context = { apiKey };
    }

    // 2. Se método for de escrita, validar body
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        if (!req.is('application/json')) {
            return res.status(415).json({ message: 'Content-Type deve ser application/json' });
        }
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: 'Body JSON não pode ser vazio' });
        }
    }

    // 3. Log de saída + latência
    res.on('finish', () => {
        const elapsed = Date.now() - start;
        console.log(`[RES] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - ${elapsed}ms`);
    });

    next();
});

module.exports = router;