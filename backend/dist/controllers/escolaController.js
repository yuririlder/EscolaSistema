"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escolaController = void 0;
const services_1 = require("../services");
const response_1 = require("../utils/response");
class EscolaController {
    async buscar(req, res) {
        try {
            const escola = await services_1.escolaService.buscar();
            if (!escola) {
                return (0, response_1.sendNotFound)(res, 'Escola');
            }
            return (0, response_1.sendSuccess)(res, escola);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async atualizar(req, res) {
        try {
            const escola = await services_1.escolaService.atualizar(req.body);
            return (0, response_1.sendSuccess)(res, escola, 'Dados da escola atualizados');
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
}
exports.escolaController = new EscolaController();
//# sourceMappingURL=escolaController.js.map