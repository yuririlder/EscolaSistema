// Enums do Domínio

export enum PerfilUsuario {
  DIRETOR = 'DIRETOR',
  SECRETARIO = 'SECRETARIO',
  COORDENADOR = 'COORDENADOR',
}

export enum StatusMatricula {
  ATIVA = 'ATIVA',
  CANCELADA = 'CANCELADA',
  CONCLUIDA = 'CONCLUIDA',
  TRANCADA = 'TRANCADA',
}

export enum StatusMensalidade {
  PENDENTE = 'PENDENTE',
  PAGO = 'PAGO',
  ATRASADO = 'ATRASADO',
  CANCELADO = 'CANCELADO',
}

export enum StatusDespesa {
  PENDENTE = 'PENDENTE',
  PAGO = 'PAGO',
  CANCELADO = 'CANCELADO',
}

export enum Turno {
  MATUTINO = 'MATUTINO',
  VESPERTINO = 'VESPERTINO',
  INTEGRAL = 'INTEGRAL',
}
