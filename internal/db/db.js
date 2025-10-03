import { configDotenv } from 'dotenv';
import pkg from 'pg';
configDotenv();
const { Pool } = pkg;

const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB || 'mydb',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    port: process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});

// Teste de conexão
pool.connect()
    .then(client => {
        console.log('Conectado ao Postgres com sucesso!');
        client.release();
    })
    .catch(err => console.error('Erro ao conectar no Postgres', err.stack));

export default pool;
