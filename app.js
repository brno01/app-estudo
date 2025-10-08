import bodyParser from 'body-parser';
import express from 'express';
import morgan from 'morgan';
import historyMiddleware from './internal/api/v1/history.js';
import requestMiddleware from './internal/api/v1/request.js';

const app = express();

import apiV1CustomerRouter from './router/api/v1/customer.js';
import apiV1OrderRouter from './router/api/v1/order.js';
import apiV1ProductRouter from './router/api/v1/product.js';

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api/v1/customer', requestMiddleware, historyMiddleware, apiV1CustomerRouter);
app.use('/api/v1/product', requestMiddleware, historyMiddleware, apiV1ProductRouter);
app.use('/api/v1/order', requestMiddleware, historyMiddleware, apiV1OrderRouter);

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization');
    if (req.method === 'OPTIONS') {
        res.header(
            'Access-Control-Allow-Methods',
            'PUT, POST, PATCH, DELETE, GET'
        );
        return res.status(200).json({});
    }
    next();
});

app.use('/api/v1', (req, res) => {
    res.status(200).json({
        status: (200),
        message: 'API funcionando!'
    });
    res.status(404).json({
        status: (404),
        message: 'Rota não encontrada!'
    });
    res.status(500).json({
        status: (500),
        message: 'Erro interno do servidor!'
    });
    res.status(400).json({
        status: (400),
        message: 'Requisição inválida!'
    });
    res.status(401 || 403).json({
        status: (401 || 403),
        message: 'Não autorizado!'
    });
    next();
});

export default app;