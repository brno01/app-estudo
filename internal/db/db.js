import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});

// Teste de conexão
pool.connect()
    .then(client => {
        console.log({
            message: 'Rodando! ✅',
            host: process.env.POSTGRES_HOST,
            port: process.env.POSTGRES_PORT,
            database: process.env.POSTGRES_DB,
            user: process.env.POSTGRES_USER
        });
        console.log({ message: 'Conectado ao Postgres com sucesso! ✅' });
        client.release();
    })
    .catch(err => console.error('Erro ao conectar no Postgres', err.stack));

export default pool;