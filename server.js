process.env.TZ = 'UTC';
import { createServer } from 'http';
import app from './app.js';

const port = process.env.PORT || 4000;
const server = createServer(app);
server.listen(port, () => {
    console.log(`Rodando na porta ${port}`);
});