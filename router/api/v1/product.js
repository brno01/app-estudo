const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Lista de produtos'
    });
});

router.get('/:id', (req, res, next) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({
            message: 'ID do produto é obrigatório!'
        });
    }
    if (id === 'especial') {
        return res.status(200).json({
            message: 'Produto especial encontrado!'
        });
    }
    if (id === 'not_found') {
        return res.status(404).json({
            message: 'Produto não encontrado!'
        });
    } else {
        res.status(200).json({
            message: `Produto encontrado com ID: ${id}`
        });
    }
});

router.post('/', (req, res, next) => {
    res.status(201).json({
        message: 'Produto criado com sucesso!'
    });
});

router.patch('/:id', (req, res, next) => {
    res.status(200).json({
        message: 'Produto atualizado com sucesso!'
    });
});

router.delete('/:id', (req, res, next) => {
    res.status(204).json({
        message: 'Produto removido com sucesso!'
    });
});

module.exports = router;