import pool from '../../db/db.js';

/**
 * Salva histórico de operações CRUD e GET
 * @param {'CREATE'|'UPDATE'|'DELETE'|'READ'} action - Tipo da operação
 * @param {string} entity - Nome da tabela afetada
 * @param {string|null} entityId - ID do registro (null para listagens)
 * @param {import('express').Request} req - Objeto da requisição
 */
export async function saveHistory(action, entity, entityId, req) {
    try {
        const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
        const port = req.socket?.remotePort || null;
        const userToken = req.context?.apiKey || null;
        const method = req.method || null;
        const path = req.originalUrl || null;

        const query = `
            INSERT INTO history
                (id, "createdAt", action, entity, "entityId", "userToken", ip, port, method, path)
            VALUES
                (gen_random_uuid(), NOW() AT TIME ZONE 'UTC', $1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;

        const values = [action, entity, entityId, userToken, ip, port, method, path];

        const { rows } = await pool.query(query, values);
        console.log('Histórico salvo:', rows[0]);
        return rows[0];
    } catch (err) {
        console.error('Erro ao salvar histórico:', err);
    }
}

export default saveHistory;