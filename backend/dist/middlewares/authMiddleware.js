"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAnyAuth = exports.requireDiretorOuSecretario = exports.requireDiretor = exports.requireAdmin = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const response_1 = require("../utils/response");
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return (0, response_1.sendUnauthorized)(res, 'Token não fornecido');
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
        return (0, response_1.sendUnauthorized)(res, 'Token mal formatado');
    }
    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
        return (0, response_1.sendUnauthorized)(res, 'Token mal formatado');
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        req.usuario = {
            id: decoded.id,
            email: decoded.email,
            perfil: decoded.perfil,
        };
        return next();
    }
    catch {
        return (0, response_1.sendUnauthorized)(res, 'Token inválido');
    }
};
exports.authMiddleware = authMiddleware;
const requireAdmin = (req, res, next) => {
    if (req.usuario?.perfil !== 'ADMIN') {
        return (0, response_1.sendForbidden)(res, 'Acesso restrito a administradores');
    }
    return next();
};
exports.requireAdmin = requireAdmin;
const requireDiretor = (req, res, next) => {
    if (!['ADMIN', 'DIRETOR'].includes(req.usuario?.perfil || '')) {
        return (0, response_1.sendForbidden)(res, 'Acesso restrito a diretores');
    }
    return next();
};
exports.requireDiretor = requireDiretor;
const requireDiretorOuSecretario = (req, res, next) => {
    if (!['ADMIN', 'DIRETOR', 'SECRETARIO'].includes(req.usuario?.perfil || '')) {
        return (0, response_1.sendForbidden)(res, 'Acesso negado');
    }
    return next();
};
exports.requireDiretorOuSecretario = requireDiretorOuSecretario;
const requireAnyAuth = (req, res, next) => {
    if (!req.usuario) {
        return (0, response_1.sendUnauthorized)(res);
    }
    return next();
};
exports.requireAnyAuth = requireAnyAuth;
//# sourceMappingURL=authMiddleware.js.map