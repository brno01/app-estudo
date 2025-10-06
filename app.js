import express from 'express';
import morgan from 'morgan';
import requestMiddleware from './internal/api/v1/request.js';
import historyMiddleware from './internal/api/v1/history.js';

const app = express();

import apiV1CustomerRouter from './router/api/v1/customer.js';
import apiV1OrderRouter from './router/api/v1/order.js';
import apiV1ProductRouter from './router/api/v1/product.js';

app.use(morgan('dev'));

app.use('/api/v1/customer', requestMiddleware, historyMiddleware, apiV1CustomerRouter);
app.use('/api/v1/product', requestMiddleware, historyMiddleware, apiV1ProductRouter);
app.use('/api/v1/order', requestMiddleware, historyMiddleware, apiV1OrderRouter);

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

export default app;