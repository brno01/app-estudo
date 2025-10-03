const express = require('express');
const morgan = require('morgan');
const requestMiddleware = require('./internal/api/v1/request');
//const historyMiddleware = require('./internal/api/v1/history');

const app = express();

const apiV1ProductRouter = require('./router/api/v1/product');
const apiV1OrderRouter = require('./router/api/v1/order');

app.use(morgan('dev'));

app.use('/api/v1/products', requestMiddleware, apiV1ProductRouter);
app.use('/api/v1/orders', requestMiddleware, apiV1OrderRouter);

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