import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../../../internal/db/db.js';
import { saveHistory } from '../../../internal/api/v1/history.js';

const router = express.Router();

// GET /api/v1/customer?page=1&limit=10
router.get('/', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { rows } = await pool.query(
            'SELECT * FROM customer WHERE active = true ORDER BY "createdAt" DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        );

        await saveHistory('READ', 'customer', null, req);
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

// GET /api/v1/customer/:id
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query(
            'SELECT * FROM customer WHERE id=$1 AND active=true',
            [id]
        );

        if (!rows[0]) return res.status(404).json({ message: 'Cliente não encontrado' });

        await saveHistory('READ', 'customer', id, req);
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
});

// POST /api/v1/customer
router.post('/', async (req, res, next) => {
    try {
        const { fullName, email, cellPhone } = req.body;
        if (!fullName || !email || !cellPhone) {
            return res.status(400).json({ message: 'fullName, email e cellPhone são obrigatórios' });
        }

        // Verifica duplicidade de email
        const { rows: existing } = await pool.query(
            'SELECT id FROM customer WHERE email=$1',
            [email]
        );
        if (existing.length > 0) return res.status(400).json({ message: 'Email já cadastrado' });

        const id = uuidv4();
        const { rows } = await pool.query(
            `INSERT INTO customer (id, "createdAt", "updatedAt", active, "fullName", email, "cellPhone")
             VALUES ($1, NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'UTC', true, $2, $3, $4)
             RETURNING *`,
            [id, fullName, email, cellPhone]
        );

        await saveHistory('CREATE', 'customer', id, req);
        res.status(201).json(rows[0]);
    } catch (err) {
        next(err);
    }
});

// PATCH /api/v1/customer/:id
router.patch('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { fullName, email, cellPhone } = req.body;

        // Verifica duplicidade de email em outro registro
        if (email) {
            const { rows: conflict } = await pool.query(
                'SELECT id FROM customer WHERE email=$1 AND id<>$2',
                [email, id]
            );
            if (conflict.length > 0) return res.status(400).json({ message: 'Email já cadastrado por outro cliente' });
        }

        const fields = [];
        const values = [];
        let idx = 1;

        if (fullName !== undefined) { fields.push(`"fullName"=$${idx++}`); values.push(fullName); }
        if (email !== undefined) { fields.push(`email=$${idx++}`); values.push(email); }
        if (cellPhone !== undefined) { fields.push(`"cellPhone"=$${idx++}`); values.push(cellPhone); }

        if (fields.length === 0) return res.status(400).json({ message: 'Nenhum campo para atualizar' });

        // Atualiza updatedAt
        fields.push(`"updatedAt"=NOW() AT TIME ZONE 'UTC'`);

        const { rows } = await pool.query(
            `UPDATE customer SET ${fields.join(', ')} WHERE id=$${idx} AND active=true RETURNING *`,
            [...values, id]
        );

        if (!rows[0]) return res.status(404).json({ message: 'Cliente não encontrado' });

        await saveHistory('UPDATE', 'customer', id, req);
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
});

// DELETE /api/v1/customer/:id (soft delete)
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query(
            `UPDATE customer SET active=false, "updatedAt"=NOW() AT TIME ZONE 'UTC'
             WHERE id=$1 AND active=true RETURNING *`,
            [id]
        );

        if (!rows[0]) return res.status(404).json({ message: 'Cliente não encontrado' });

        await saveHistory('DELETE', 'customer', id, req);
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
});

export default router;