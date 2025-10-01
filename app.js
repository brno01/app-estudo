const express = require('express');
const app = express();

const productRouter = require('./router/product');

app.use('/apiv1/products', productRouter);

app.use('/apiv1', (req, res, next) => {
    res.status(200).send({
        message: 'Tudo funcionando!'
    });
    res.status(404).send({
        message: 'Rota não encontrada!'
    });
    res.status(500).send({
        message: 'Erro interno do servidor!'
    });
    res.status(400).send({
        message: 'Requisição inválida!'
    });
    res.status(401 || 403).send({
        message: 'Não autorizado!'
    });
    next();
});

module.exports = app;