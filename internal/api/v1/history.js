const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASS || 'postgres',
    database: process.env.PG_DB || 'mydb',
});

module.exports = (req, res, next) => {
    const start = Date.now();

    res.on('finish', async () => {
        const duration = Date.now() - start;
        const query = `
      INSERT INTO request_history 
        (method, url, status, ip, port, api_key, body, params, query, timestamp, duration_ms)
      VALUES 
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    `;
        const values = [
            req.method,
            req.originalUrl,
            res.statusCode,
            req.ip,
            req.socket.remotePort,
            req.context?.apiKey || null,
            req.body ? JSON.stringify(req.body) : null,
            req.params ? JSON.stringify(req.params) : null,
            req.query ? JSON.stringify(req.query) : null,
            new Date(),
            duration
        ];

        try {
            await pool.query(query, values);
        } catch (err) {
            console.error('Erro ao salvar histórico:', err.message);
        }
    });

    next();
};