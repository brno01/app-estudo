const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).send({
        message: 'Lista de produtos'
    });
});

router.get('/:id', (req, res, next) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).send({
            message: 'ID do produto é obrigatório!'
        });
    }
    if (id === 'especial') {
        return res.status(200).send({
            message: 'Produto especial encontrado!'
        });
    }
    if (id === 'not_found') {
        return res.status(404).send({
            message: 'Produto não encontrado!'
        });
    } else {
        res.status(200).send({
            message: `Produto encontrado com ID: ${id}`
        });
    }
});

router.post('/', (req, res, next) => {
    res.status(201).send({
        message: 'Produto criado com sucesso!'
    });
});

router.patch('/:id', (req, res, next) => {
    res.status(200).send({
        message: 'Produto atualizado com sucesso!'
    });
});

router.delete('/:id', (req, res, next) => {
    res.status(204).send({
        message: 'Produto removido com sucesso!'
    });
});

module.exports = router;