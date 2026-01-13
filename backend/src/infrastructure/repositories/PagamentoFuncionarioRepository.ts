import { prisma } from '../database/prisma';
import { IPagamentoFuncionarioRepository } from '../../domain/repositories/IRepositories';

export class PagamentoFuncionarioRepository implements IPagamentoFuncionarioRepository {
  async criar(data: any) {
    return prisma.pagamentoFuncionario.create({
      data,
      include: {
        funcionario: true,
      },
    });
  }

  async buscarPorId(id: string) {
    return prisma.pagamentoFuncionario.findUnique({
      where: { id },
      include: {
        funcionario: true,
      },
    });
  }

  async buscarPorFuncionario(funcionarioId: string) {
    return prisma.pagamentoFuncionario.findMany({
      where: { funcionarioId },
      orderBy: [{ anoReferencia: 'desc' }, { mesReferencia: 'desc' }],
    });
  }

  async buscarPorMesAno(mes: number, ano: number) {
    return prisma.pagamentoFuncionario.findMany({
      where: {
        mesReferencia: mes,
        anoReferencia: ano,
      },
      include: {
        funcionario: true,
      },
      orderBy: { funcionario: { nome: 'asc' } },
    });
  }

  async buscarPendentes() {
    return prisma.pagamentoFuncionario.findMany({
      where: { status: 'PENDENTE' },
      include: {
        funcionario: true,
      },
      orderBy: [{ anoReferencia: 'asc' }, { mesReferencia: 'asc' }],
    });
  }

  async registrarPagamento(id: string, data: Date) {
    return prisma.pagamentoFuncionario.update({
      where: { id },
      data: {
        dataPagamento: data,
        status: 'PAGO',
      },
    });
  }

  async atualizar(id: string, data: any) {
    return prisma.pagamentoFuncionario.update({
      where: { id },
      data,
    });
  }
}
