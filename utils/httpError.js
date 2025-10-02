class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        Error.captureStackTrace(this, this.constructor);
    }
}

function createError(status, message) {
    return new HttpError(status, message);
}

module.exports = { HttpError, createError };