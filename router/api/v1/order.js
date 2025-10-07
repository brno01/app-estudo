import express from 'express';
import BaseModel from '../../../common/baseModel.js';
import { saveHistory } from '../../../internal/api/v1/history.js';
import pool from '../../../internal/db/db.js';

const router = express.Router();

// GET /api/v1/order → lista pedidos com paginação
router.get('/', async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const { rows } = await pool.query(
            `SELECT id, "createdAt", "updatedAt", active, "productId", "customerId", quantity, total
             FROM "order"
             WHERE active=true
             ORDER BY "createdAt" DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        // await saveHistory('READ', 'order', null, req);
        res.status(200).json({
            page,
            count: rows.length,
            data: rows
        });
    } catch (err) { next(err); }
});

// GET /api/v1/order/:id → pedido específico
router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query(
            `SELECT id, "createdAt", "updatedAt", active, "productId", "customerId", quantity, total
             FROM "order"
             WHERE id=$1 AND active=true`,
            [id]
        );
        if (!rows[0]) return res.status(404).json({ message: 'Pedido não encontrado' });
        await saveHistory('READ', 'order', id, req);
        res.status(200).json({
            status: "success",
            order: rows[0]
        });
    } catch (err) { next(err); }
});

// POST /api/v1/order → cria pedido
router.post('/', async (req, res, next) => {
    const { productId, customerId, quantity } = req.body;
    if (!productId || !customerId || quantity == null) return res.status(400).json({ message: 'productId, customerId e quantity são obrigatórios' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const prodRes = await client.query('SELECT id, price, stock FROM product WHERE id=$1 FOR UPDATE', [productId]);
        const product = prodRes.rows[0];
        if (!product) { await client.query('ROLLBACK'); return res.status(404).json({ message: 'Produto não encontrado' }); }
        if (product.stock < quantity) { await client.query('ROLLBACK'); return res.status(400).json({ message: 'Estoque insuficiente' }); }

        const total = Number(product.price) * Number(quantity);
        const order = new BaseModel({ productId, customerId, quantity, total });

        const insertRes = await client.query(
            `INSERT INTO "order" (id, "createdAt", "updatedAt", active, "productId", "customerId", quantity, total)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
             RETURNING *`,
            [order.id, order.createdAt, order.updatedAt, order.active, productId, customerId, quantity, total]
        );

        await client.query(
            `UPDATE product SET stock = stock - $1, "updatedAt" = $2 WHERE id = $3`,
            [quantity, new Date().toISOString().replace('T', ' ').replace('Z', ''), productId]
        );

        await client.query('COMMIT');

        await saveHistory('CREATE', 'order', insertRes.rows[0].id, req);
        res.status(201).json({
            status: "success",
            order: insertRes.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        next(err);
    } finally {
        client.release();
    }
});

// PATCH /api/v1/order/:id → atualiza pedido
router.patch('/:id', async (req, res, next) => {
    const { id } = req.params;
    const { quantity, productId, customerId } = req.body;

    // Validação de input
    if (quantity == null || !Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'quantity inválido' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Bloqueia o pedido para update
        const ordRes = await client.query(
            'SELECT * FROM "order" WHERE id=$1 FOR UPDATE',
            [id]
        );
        const order = ordRes.rows[0];
        if (!order) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Pedido não encontrado' });
        }

        // Verifica se o productId existe
        const prodRes = await client.query(
            'SELECT id, price, stock FROM product WHERE id=$1 FOR UPDATE',
            [productId || order.productId]
        );
        const product = prodRes.rows[0];
        if (!product) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        // Verifica se o customerId existe
        const custRes = await client.query(
            'SELECT id FROM customer WHERE id=$1',
            [customerId || order.customerId]
        );
        const customer = custRes.rows[0];
        if (!customer) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Cliente não encontrado' });
        }

        // Verifica estoque
        const delta = quantity - order.quantity;
        if (delta > 0 && product.stock < delta) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Estoque insuficiente' });
        }
        if (product.stock <= 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Produto sem estoque' });
        }

        const newTotal = Number(product.price) * quantity;

        // Atualiza o pedido
        await client.query(
            `UPDATE "order"
             SET quantity=$1, total=$2, "productId"=$3, "customerId"=$4, "updatedAt"=NOW()
             WHERE id=$5`,
            [quantity, newTotal, product.id, customer.id, id]
        );

        // Atualiza o estoque do produto
        if (delta !== 0) {
            await client.query(
                `UPDATE product
                 SET stock = stock - $1, "updatedAt"=NOW()
                 WHERE id=$2`,
                [delta, product.id]
            );
        }

        await client.query('COMMIT');

        // Salva histórico
        await saveHistory('UPDATE', 'order', id, req);

        // Retorna o pedido atualizado
        const { rows } = await pool.query(
            'SELECT id, "createdAt", "updatedAt", active, "productId", "customerId", quantity, total FROM "order" WHERE id=$1',
            [id]
        );

        res.status(200).json({
            status: 'success',
            order: rows[0],
        });

    } catch (err) {
        await client.query('ROLLBACK');
        next(err);
    } finally {
        client.release();
    }
});

// DELETE /api/v1/order/:id → soft delete
router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query(
            `UPDATE "order" SET active=false, "updatedAt"=$1 WHERE id=$2 RETURNING *`,
            [new Date().toISOString().replace('T', ' ').replace('Z', ''), id]
        );
        if (!rows[0]) return res.status(404).json({ message: 'Pedido não encontrado' });

        await saveHistory('DELETE', 'order', id, req);
        res.status(204).json({
            status: "success",
            order: rows[0]
        });
    } catch (err) { next(err); }
});

export default router;