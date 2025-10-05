import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});

// Teste de conexão
pool.connect()
    .then(client => {
        console.log({
            message: 'Rodando! ✅',
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER
        });
        console.log({ message: 'Conectado ao Postgres com sucesso! ✅' });
        client.release();
    })
    .catch(err => console.error('Erro ao conectar no Postgres', err.stack));

export default pool;