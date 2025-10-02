const historyLog = [];

/**
 * Registra uma operação realizada em um recurso
 * @param {string} resource - 'product', 'order', etc.
 * @param {string} method - 'GET', 'POST', etc.
 * @param {string|undefined} id - id do recurso
 * @param {object} body - corpo da requisição
 */
function record(resource, method, id, body) {
    const entry = {
        timestamp: new Date().toISOString(),
        resource,
        method,
        id: id || null,
        body: body || null,
    };
    historyLog.push(entry);
    console.log('HISTORY:', entry);
}

/**
 * Retorna todo o histórico
 */
function getHistory() {
    return historyLog;
}

module.exports = { record, getHistory };