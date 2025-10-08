import express from 'express';
import BaseModel from '../../../common/baseModel.js';
import { saveHistory } from '../../../internal/api/v1/history.js';
import pool from '../../../internal/db/db.js';

const router = express.Router();

// GET /api/v1/product → lista produtos com paginação
router.get('/', async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        if (page < 1 || limit < 1) {
            return res.status(400).json({
                error: 'Parâmetros "page" e "limit" devem ser números positivos.'
            });
        }

        const offset = (page - 1) * limit;

        const { rows } = await pool.query(
            `SELECT id, "createdAt", "updatedAt", active, name, price, stock
             FROM product
             WHERE active = true
             ORDER BY "createdAt" DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        try {
            await saveHistory('READ', 'product', null, req);
        } catch (historyErr) {
            console.error('Falha ao salvar histórico:', historyErr);
        }

        return res.status(200).json({
            page,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);

        if (error.code === '22P02') {
            return res.status(400).json({
                error: 'Parâmetros inválidos. Verifique os valores enviados.'
            });
        }

        return res.status(500).json({
            error: 'Erro interno ao buscar produtos.'
        });
    }
});

// GET /api/v1/product/:id → produto específico
router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query(
            `SELECT id, "createdAt", "updatedAt", active, name, price, stock
             FROM product
             WHERE id=$1 AND active=true`,
            [id]
        );
        if (!rows[0]) return res.status(404).json({ message: 'Produto não encontrado' });
        await saveHistory('READ', 'product', id, req);
        res.status(200).json({
            status: "success",
            product: rows[0]
        });
    } catch (err) { next(err); }
});

// POST /api/v1/product → cria produto
router.post('/', async (req, res, next) => {
    const { name, price, stock } = req.body;
    if (!name || price == null || stock == null) return res.status(400).json({ message: 'name, price e stock são obrigatórios' });

    try {
        const product = new BaseModel({ name, price, stock });
        const { rows } = await pool.query(
            `INSERT INTO product (id, "createdAt", "updatedAt", active, name, price, stock)
             VALUES ($1,$2,$3,$4,$5,$6,$7)
             RETURNING *`,
            [product.id, product.createdAt, product.updatedAt, product.active, name, price, stock]
        );
        await saveHistory('CREATE', 'product', rows[0].id, req);
        res.status(201).json({
            status: "success",
            product: rows[0]
        });
    } catch (err) { next(err); }
});

// PATCH /api/v1/product/:id → atualiza produto
router.patch('/:id', async (req, res, next) => {
    const { id } = req.params;
    const fields = ['name', 'price', 'stock', 'active'];
    const updates = [];
    const values = [];

    fields.forEach(f => {
        if (req.body[f] !== undefined) {
            updates.push(`"${f}"=$${values.length + 1}`);
            values.push(req.body[f]);
        }
    });

    if (updates.length === 0) return res.status(400).json({ message: 'Nenhum campo para atualizar' });

    updates.push(`"updatedAt"=$${values.length + 1}`);
    values.push(new Date().toISOString().replace('T', ' ').replace('Z', ''));
    values.push(id);

    try {
        const { rows } = await pool.query(
            `UPDATE product SET ${updates.join(', ')} WHERE id=$${values.length} RETURNING *`,
            values
        );
        if (!rows[0]) return res.status(404).json({ message: 'Produto não encontrado' });

        await saveHistory('UPDATE', 'product', id, req);
        res.status(200).json({
            status: "success",
            product: rows[0]
        });
    } catch (err) { next(err); }
});

// DELETE /api/v1/product/:id → soft delete
router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query(
            `UPDATE product SET active=false, "updatedAt"=$1 WHERE id=$2 RETURNING *`,
            [new Date().toISOString().replace('T', ' ').replace('Z', ''), id]
        );
        if (!rows[0]) return res.status(404).json({ message: 'Produto não encontrado' });

        await saveHistory('DELETE', 'product', id, req);
        res.status(204).json({
            status: "success",
            product: rows[0]
        });
    } catch (err) { next(err); }
});

export default router;