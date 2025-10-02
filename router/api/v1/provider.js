const express = require('express');
const router = express.Router();
const requestController = require('../../internal/api/v1/request');

// Todas as operações de provider passam pelo request.js
router.all('/:id?', (req, res, next) => {
    requestController.handle('provider', req, res, next);
});

module.exports = router;