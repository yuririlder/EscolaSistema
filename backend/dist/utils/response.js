"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendServerError = exports.sendValidationError = exports.sendForbidden = exports.sendUnauthorized = exports.sendNotFound = exports.sendError = exports.sendNoContent = exports.sendCreated = exports.sendSuccess = void 0;
const sendSuccess = (res, data, message, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        data,
        message
    });
};
exports.sendSuccess = sendSuccess;
const sendCreated = (res, data, message) => {
    return (0, exports.sendSuccess)(res, data, message, 201);
};
exports.sendCreated = sendCreated;
const sendNoContent = (res) => {
    return res.status(204).send();
};
exports.sendNoContent = sendNoContent;
const sendError = (res, error, statusCode = 400, details) => {
    return res.status(statusCode).json({
        success: false,
        error,
        details
    });
};
exports.sendError = sendError;
const sendNotFound = (res, resource = 'Recurso') => {
    return (0, exports.sendError)(res, `${resource} não encontrado`, 404);
};
exports.sendNotFound = sendNotFound;
const sendUnauthorized = (res, message = 'Não autorizado') => {
    return (0, exports.sendError)(res, message, 401);
};
exports.sendUnauthorized = sendUnauthorized;
const sendForbidden = (res, message = 'Acesso negado') => {
    return (0, exports.sendError)(res, message, 403);
};
exports.sendForbidden = sendForbidden;
const sendValidationError = (res, errors) => {
    return (0, exports.sendError)(res, 'Erro de validação', 422, errors);
};
exports.sendValidationError = sendValidationError;
const sendServerError = (res, error) => {
    return (0, exports.sendError)(res, 'Erro interno do servidor', 500, process.env.NODE_ENV === 'development' ? error.message : undefined);
};
exports.sendServerError = sendServerError;
//# sourceMappingURL=response.js.map