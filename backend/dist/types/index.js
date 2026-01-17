"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Turno = exports.StatusPagamento = exports.StatusDespesa = exports.StatusMensalidade = exports.StatusMatricula = exports.PerfilUsuario = void 0;
// Enums
var PerfilUsuario;
(function (PerfilUsuario) {
    PerfilUsuario["ADMIN"] = "ADMIN";
    PerfilUsuario["DIRETOR"] = "DIRETOR";
    PerfilUsuario["SECRETARIO"] = "SECRETARIO";
    PerfilUsuario["COORDENADOR"] = "COORDENADOR";
})(PerfilUsuario || (exports.PerfilUsuario = PerfilUsuario = {}));
var StatusMatricula;
(function (StatusMatricula) {
    StatusMatricula["ATIVA"] = "ATIVA";
    StatusMatricula["CANCELADA"] = "CANCELADA";
    StatusMatricula["CONCLUIDA"] = "CONCLUIDA";
    StatusMatricula["TRANCADA"] = "TRANCADA";
})(StatusMatricula || (exports.StatusMatricula = StatusMatricula = {}));
var StatusMensalidade;
(function (StatusMensalidade) {
    StatusMensalidade["PENDENTE"] = "PENDENTE";
    StatusMensalidade["PAGO"] = "PAGO";
    StatusMensalidade["ATRASADO"] = "ATRASADO";
    StatusMensalidade["CANCELADO"] = "CANCELADO";
})(StatusMensalidade || (exports.StatusMensalidade = StatusMensalidade = {}));
var StatusDespesa;
(function (StatusDespesa) {
    StatusDespesa["PENDENTE"] = "PENDENTE";
    StatusDespesa["PAGO"] = "PAGO";
    StatusDespesa["CANCELADO"] = "CANCELADO";
})(StatusDespesa || (exports.StatusDespesa = StatusDespesa = {}));
var StatusPagamento;
(function (StatusPagamento) {
    StatusPagamento["PENDENTE"] = "PENDENTE";
    StatusPagamento["PAGO"] = "PAGO";
})(StatusPagamento || (exports.StatusPagamento = StatusPagamento = {}));
var Turno;
(function (Turno) {
    Turno["MATUTINO"] = "MATUTINO";
    Turno["VESPERTINO"] = "VESPERTINO";
    Turno["INTEGRAL"] = "INTEGRAL";
})(Turno || (exports.Turno = Turno = {}));
//# sourceMappingURL=index.js.map