const express = require('express');
const morgan = require('morgan');
const { createError } = require('./utils/httpError');

const apiV1ProviderRequestRouter = require('./internal/api/v1/request'); // não muda
const apiV1ProviderHistoryRouter = require('./internal/api/v1/history'); // histórico
const apiV1ProductRouter = require('./router/api/v1/product');
const apiV1OrderRouter = require('./router/api/v1/order');
const apiV1ProviderRouter = require('./router/api/v1/provider');

const app = express();

app.use(morgan('dev'));
app.use(express.json());

// Rotas principais
app.use('/api/v1/products', apiV1ProductRouter);
app.use('/api/v1/orders', apiV1OrderRouter);
app.use('/api/v1/providers', apiV1ProviderRouter);

// Endpoint para consultar histórico
app.use('/api/v1/history', apiV1ProviderHistoryRouter);

// Healthcheck
app.get('/api/v1', (req, res) => {
    res.status(200).json({ message: 'Tudo funcionando!' });
});

// 404 para rotas inexistentes
app.use((req, res, next) => {
    next(createError(404, 'Rota não encontrada!'));
});

// Middleware centralizado de erros
app.use((err, req, res, next) => {
    console.error(err);
    const status = err.status || 500;
    const message = err.message || 'Erro interno do servidor!';
    res.status(status).json({ message });
});

module.exports = app;