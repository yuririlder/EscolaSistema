"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const response_1 = require("../utils/response");
const errorHandler = (err, req, res, next) => {
    logger_1.logger.error('Erro não tratado', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });
    return (0, response_1.sendServerError)(res, err);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    return (0, response_1.sendError)(res, 'Rota não encontrada', 404);
};
exports.notFoundHandler = notFoundHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map