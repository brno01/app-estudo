const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Lista de pedidos'
    });
});

router.get('/:id', (req, res, next) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({
            message: 'ID do pedido é obrigatório!'
        });
    }
    if (id === 'especial') {
        return res.status(200).json({
            message: 'Pedido especial encontrado!'
        });
    }
    if (id === 'not_found') {
        return res.status(404).json({
            message: `Pedido com id:${id} não encontrado!`
        });
    } else {
        res.status(200).json({
            message: `Pedido encontrado`,
            id: id
        });
    }
});

router.post('/', (req, res, next) => {
    res.status(201).json({
        message: 'Pedido criado com sucesso!',
    });
});

router.patch('/:id', (req, res, next) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({
            message: 'ID do Pedido é obrigatório!'
        });
    }
    if (id === 'not_found') {
        return res.status(404).json({
            message: 'Pedido não encontrado!'
        });
    } else {
        res.status(200).json({
            message: `Pedido atualizado com sucesso!`,
            id: id
        });
    }
});

router.delete('/:id', (req, res, next) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({
            message: 'ID do Pedido é obrigatório!'
        });
    }
    if (id === 'not_found') {
        return res.status(404).json({
            message: 'Pedido não encontrado!'
        });
    } else {
        res.status(200).json({
            message: `Pedido deletado com sucesso!`,
            id: id
        });
    }
});

module.exports = router;