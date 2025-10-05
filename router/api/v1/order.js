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
            `SELECT id, "createdAt", "updatedAt", active, productId, quantity, total
             FROM "order"
             WHERE active=true
             ORDER BY "createdAt" DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        await saveHistory('READ', 'order', null, req);
        res.json(rows);
    } catch (err) { next(err); }
});

// GET /api/v1/order/:id → pedido específico
router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query(
            `SELECT id, "createdAt", "updatedAt", active, productId, quantity, total
             FROM "order"
             WHERE id=$1 AND active=true`,
            [id]
        );
        if (!rows[0]) return res.status(404).json({ message: 'Pedido não encontrado' });
        await saveHistory('READ', 'order', id, req);
        res.json(rows[0]);
    } catch (err) { next(err); }
});

// POST /api/v1/order → cria pedido
router.post('/', async (req, res, next) => {
    const { productId, quantity } = req.body;
    if (!productId || quantity == null) return res.status(400).json({ message: 'productId e quantity são obrigatórios' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const prodRes = await client.query('SELECT id, price, stock FROM product WHERE id=$1 FOR UPDATE', [productId]);
        const product = prodRes.rows[0];
        if (!product) { await client.query('ROLLBACK'); return res.status(404).json({ message: 'Produto não encontrado' }); }
        if (product.stock < quantity) { await client.query('ROLLBACK'); return res.status(400).json({ message: 'Estoque insuficiente' }); }

        const total = Number(product.price) * Number(quantity);
        const order = new BaseModel({ productId, quantity, total });

        const insertRes = await client.query(
            `INSERT INTO "order" (id, "createdAt", "updatedAt", active, productId, quantity, total)
             VALUES ($1,$2,$3,$4,$5,$6,$7)
             RETURNING *`,
            [order.id, order.createdAt, order.updatedAt, order.active, productId, quantity, total]
        );

        await client.query(
            `UPDATE product SET stock = stock - $1, "updatedAt" = $2 WHERE id = $3`,
            [quantity, new Date().toISOString().replace('T', ' ').replace('Z', ''), productId]
        );

        await client.query('COMMIT');

        await saveHistory('CREATE', 'order', insertRes.rows[0].id, req);
        res.status(201).json(insertRes.rows[0]);
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
    const { quantity } = req.body;
    if (quantity == null || !Number.isInteger(quantity)) return res.status(400).json({ message: 'quantity inválido' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const ordRes = await client.query('SELECT * FROM "order" WHERE id=$1 FOR UPDATE', [id]);
        const order = ordRes.rows[0];
        if (!order) { await client.query('ROLLBACK'); return res.status(404).json({ message: 'Pedido não encontrado' }); }

        const prodRes = await client.query('SELECT id, price, stock FROM product WHERE id=$1 FOR UPDATE', [order.productId]);
        const product = prodRes.rows[0];
        if (!product) { await client.query('ROLLBACK'); return res.status(404).json({ message: 'Produto não encontrado' }); }

        const delta = quantity - order.quantity;
        if (delta > 0 && product.stock < delta) { await client.query('ROLLBACK'); return res.status(400).json({ message: 'Estoque insuficiente' }); }

        const newTotal = Number(product.price) * Number(quantity);

        await client.query(
            `UPDATE "order" SET quantity=$1, total=$2, "updatedAt"=$3 WHERE id=$4`,
            [quantity, newTotal, new Date().toISOString().replace('T', ' ').replace('Z', ''), id]
        );

        await client.query(
            `UPDATE product SET stock = stock - $1, "updatedAt"=$2 WHERE id=$3`,
            [delta, new Date().toISOString().replace('T', ' ').replace('Z', ''), product.id]
        );

        await client.query('COMMIT');

        await saveHistory('UPDATE', 'order', id, req);

        const { rows } = await pool.query('SELECT id, "createdAt", "updatedAt", active, productId, quantity, total FROM "order" WHERE id=$1', [id]);
        res.json(rows[0]);
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
        res.sendStatus(204);
    } catch (err) { next(err); }
});

export default router;