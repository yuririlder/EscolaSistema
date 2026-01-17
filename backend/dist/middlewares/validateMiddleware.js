"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateId = exports.validateMatricula = exports.validateNota = exports.validateTurma = exports.validateResponsavel = exports.validateAluno = exports.validateUsuario = exports.validateLogin = exports.validate = void 0;
const express_validator_1 = require("express-validator");
const response_1 = require("../utils/response");
const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty()) {
            return next();
        }
        return (0, response_1.sendValidationError)(res, errors.array());
    };
};
exports.validate = validate;
// Validações comuns
const express_validator_2 = require("express-validator");
exports.validateLogin = [
    (0, express_validator_2.body)('email').notEmpty().withMessage('E-mail é obrigatório'),
    (0, express_validator_2.body)('senha').notEmpty().withMessage('Senha é obrigatória')
];
exports.validateUsuario = [
    (0, express_validator_2.body)('nome').notEmpty().withMessage('Nome é obrigatório'),
    (0, express_validator_2.body)('email').isEmail().withMessage('E-mail inválido'),
    (0, express_validator_2.body)('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
    (0, express_validator_2.body)('perfil').isIn(['ADMIN', 'DIRETOR', 'SECRETARIO', 'COORDENADOR']).withMessage('Perfil inválido')
];
exports.validateAluno = [
    (0, express_validator_2.body)('nome').notEmpty().withMessage('Nome é obrigatório'),
    (0, express_validator_2.body)('data_nascimento').isISO8601().withMessage('Data de nascimento inválida'),
    (0, express_validator_2.body)('responsavel_id').isUUID().withMessage('ID do responsável inválido'),
    (0, express_validator_2.body)('cpf').optional({ nullable: true, checkFalsy: true }).isLength({ min: 11, max: 14 }).withMessage('CPF inválido')
];
exports.validateResponsavel = [
    (0, express_validator_2.body)('nome').notEmpty().withMessage('Nome é obrigatório'),
    (0, express_validator_2.body)('cpf')
        .notEmpty().withMessage('CPF é obrigatório')
        .isLength({ min: 11, max: 14 }).withMessage('CPF deve ter 11 dígitos')
];
exports.validateTurma = [
    (0, express_validator_2.body)('nome').notEmpty().withMessage('Nome é obrigatório'),
    (0, express_validator_2.body)('ano').isInt({ min: 2000, max: 2100 }).withMessage('Ano inválido'),
    (0, express_validator_2.body)('turno').isIn(['MATUTINO', 'VESPERTINO', 'INTEGRAL']).withMessage('Turno inválido')
];
exports.validateNota = [
    (0, express_validator_2.body)('aluno_id').isUUID().withMessage('ID do aluno inválido'),
    (0, express_validator_2.body)('disciplina').notEmpty().withMessage('Disciplina é obrigatória'),
    (0, express_validator_2.body)('bimestre').isInt({ min: 1, max: 4 }).withMessage('Bimestre deve ser entre 1 e 4'),
    (0, express_validator_2.body)('nota').isFloat({ min: 0, max: 10 }).withMessage('Nota deve ser entre 0 e 10')
];
exports.validateMatricula = [
    (0, express_validator_2.body)('aluno_id').isUUID().withMessage('ID do aluno inválido'),
    (0, express_validator_2.body)('plano_id').isUUID().withMessage('ID do plano inválido'),
    (0, express_validator_2.body)('ano_letivo').isInt({ min: 2000, max: 2100 }).withMessage('Ano letivo inválido'),
    (0, express_validator_2.body)('valor_matricula').isFloat({ min: 0 }).withMessage('Valor da matrícula inválido')
];
exports.validateId = [
    (0, express_validator_2.param)('id').isUUID().withMessage('ID inválido')
];
//# sourceMappingURL=validateMiddleware.js.map