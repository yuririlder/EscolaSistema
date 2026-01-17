export { authMiddleware, requireAdmin, requireDiretor, requireDiretorOuSecretario, requireAnyAuth } from './authMiddleware';
export { validate, validateLogin, validateUsuario, validateAluno, validateResponsavel, validateTurma, validateNota, validateMatricula, validateId } from './validateMiddleware';
export { errorHandler, notFoundHandler, asyncHandler } from './errorHandler';
