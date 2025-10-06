import chalk from 'chalk';
import express from 'express';

const router = express.Router();

router.use(express.json());

router.use((req, res, next) => {
    const start = Date.now();

    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return res.status(401).json({ message: 'API Key é obrigatória' });
    }
    req.context = { apiKey };

    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        if (!req.is('application/json')) {
            return res.status(415).json({ message: 'Content-Type deve ser application/json' });
        }
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: 'Body JSON não pode ser vazio' });
        }
    }

    res.on('finish', () => {
        const elapsed = Date.now() - start;

        const methodColor = chalk.cyan.bold(req.method);
        const urlColor = chalk.yellow(req.originalUrl);
        const statusColor =
            res.statusCode >= 200 && res.statusCode < 300
                ? chalk.green(res.statusCode)
                : res.statusCode >= 400 && res.statusCode < 500
                    ? chalk.red(res.statusCode)
                    : chalk.magenta(res.statusCode);
        const timeColor = chalk.blue(`${elapsed}ms`);

        console.log(`[${methodColor}] ${urlColor} - Status: ${statusColor} - Tempo: ${timeColor}`);
    });

    next();
});

export default router;
