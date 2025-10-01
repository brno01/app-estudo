const express = require('express');
const app = express();
const apiV1ProductRouter = require('./router/api/v1/product');

app.use('/api/v1/products', apiV1ProductRouter);

app.use('/api/v1', (req, res) => {
    res.status(200).json({
        message: 'Tudo funcionando!'
    });
    res.status(404).json({
        message: 'Rota não encontrada!'
    });
    res.status(500).json({
        message: 'Erro interno do servidor!'
    });
    res.status(400).json({
        message: 'Requisição inválida!'
    });
    res.status(401 || 403).json({
        message: 'Não autorizado!'
    });
    next();
});

module.exports = app;