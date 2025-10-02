const { createError } = require('../../../utils/httpError');
const history = require('./history');

async function handle(resource, req, res, next) {
    try {
        const id = req.params.id;
        const body = req.body;
        const method = req.method.toUpperCase();

        // Registrar no histórico
        history.record(resource, method, id, body);

        switch (resource) {
            case 'product':
                return handleProduct(method, id, body, res, next);
            case 'order':
                return handleOrder(method, id, body, res, next);
            case 'provider':
                return handleProvider(method, id, body, res, next);
            default:
                return next(createError(400, 'Recurso inválido!'));
        }
    } catch (err) {
        next(err);
    }
}

// --------------------- HANDLERS ---------------------

function handleProduct(method, id, body, res, next) {
    switch (method) {
        case 'GET':
            if (!id) return res.status(200).json({ message: 'Lista de produtos' });
            if (id === 'especial') return res.status(200).json({ message: 'Produto especial encontrado!' });
            if (id === 'not_found') return next(createError(404, `Produto com id:${id} não encontrado!`));
            return res.status(200).json({ message: 'Produto encontrado', id });

        case 'POST':
            return res.status(201).json({ message: 'Produto criado com sucesso!', body });

        case 'PATCH':
            if (!id) return next(createError(400, 'ID do produto é obrigatório!'));
            if (id === 'not_found') return next(createError(404, 'Produto não encontrado!'));
            return res.status(200).json({ message: 'Produto atualizado com sucesso!', id, body });

        case 'DELETE':
            if (!id) return next(createError(400, 'ID do produto é obrigatório!'));
            if (id === 'not_found') return next(createError(404, 'Produto não encontrado!'));
            return res.status(200).json({ message: 'Produto deletado com sucesso!', id });

        default:
            return next(createError(405, 'Método não permitido!'));
    }
}

function handleOrder(method, id, body, res, next) {
    switch (method) {
        case 'GET':
            if (!id) return res.status(200).json({ message: 'Lista de pedidos' });
            if (id === 'not_found') return next(createError(404, `Pedido com id:${id} não encontrado!`));
            return res.status(200).json({ message: 'Pedido encontrado', id });

        case 'POST':
            return res.status(201).json({ message: 'Pedido criado com sucesso!', body });

        case 'PATCH':
            if (!id) return next(createError(400, 'ID do pedido é obrigatório!'));
            if (id === 'not_found') return next(createError(404, 'Pedido não encontrado!'));
            return res.status(200).json({ message: 'Pedido atualizado com sucesso!', id, body });

        case 'DELETE':
            if (!id) return next(createError(400, 'ID do pedido é obrigatório!'));
            if (id === 'not_found') return next(createError(404, 'Pedido não encontrado!'));
            return res.status(200).json({ message: 'Pedido deletado com sucesso!', id });

        default:
            return next(createError(405, 'Método não permitido!'));
    }
}

function handleProvider(method, id, body, res, next) {
    switch (method) {
        case 'GET':
            if (!id) return res.status(200).json({ message: 'Lista de providers' });
            if (id === 'not_found') return next(createError(404, `Provider com id:${id} não encontrado!`));
            return res.status(200).json({ message: 'Provider encontrado', id });

        case 'POST':
            return res.status(201).json({ message: 'Provider criado com sucesso!', body });

        case 'PATCH':
            if (!id) return next(createError(400, 'ID do provider é obrigatório!'));
            if (id === 'not_found') return next(createError(404, 'Provider não encontrado!'));
            return res.status(200).json({ message: 'Provider atualizado com sucesso!', id, body });

        case 'DELETE':
            if (!id) return next(createError(400, 'ID do provider é obrigatório!'));
            if (id === 'not_found') return next(createError(404, 'Provider não encontrado!'));
            return res.status(200).json({ message: 'Provider deletado com sucesso!', id });

        default:
            return next(createError(405, 'Método não permitido!'));
    }
}

module.exports = { handle };