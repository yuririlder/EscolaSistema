import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { sendValidationError } from '../utils/response';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return sendValidationError(res, errors.array());
  };
};

// Validações comuns
import { body, param, query } from 'express-validator';

export const validateLogin = [
  body('email').notEmpty().withMessage('E-mail é obrigatório'),
  body('senha').notEmpty().withMessage('Senha é obrigatória')
];

export const validateUsuario = [
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('E-mail inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('perfil').isIn(['ADMIN', 'DIRETOR', 'SECRETARIO', 'COORDENADOR']).withMessage('Perfil inválido')
];

export const validateAluno = [
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('data_nascimento').isISO8601().withMessage('Data de nascimento inválida'),
  body('responsavel_id').isUUID().withMessage('ID do responsável inválido')
];

export const validateResponsavel = [
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('cpf').notEmpty().withMessage('CPF é obrigatório')
];

export const validateTurma = [
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('ano').isInt({ min: 2000, max: 2100 }).withMessage('Ano inválido'),
  body('turno').isIn(['MATUTINO', 'VESPERTINO', 'INTEGRAL']).withMessage('Turno inválido')
];

export const validateNota = [
  body('aluno_id').isUUID().withMessage('ID do aluno inválido'),
  body('disciplina').notEmpty().withMessage('Disciplina é obrigatória'),
  body('bimestre').isInt({ min: 1, max: 4 }).withMessage('Bimestre deve ser entre 1 e 4'),
  body('nota').isFloat({ min: 0, max: 10 }).withMessage('Nota deve ser entre 0 e 10')
];

export const validateMatricula = [
  body('aluno_id').isUUID().withMessage('ID do aluno inválido'),
  body('plano_id').isUUID().withMessage('ID do plano inválido'),
  body('ano_letivo').isInt({ min: 2000, max: 2100 }).withMessage('Ano letivo inválido'),
  body('valor_matricula').isFloat({ min: 0 }).withMessage('Valor da matrícula inválido')
];

export const validateId = [
  param('id').isUUID().withMessage('ID inválido')
];
