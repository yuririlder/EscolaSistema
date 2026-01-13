import { prisma } from '../database/prisma';
import { IMensalidadeRepository } from '../../domain/repositories/IRepositories';

export class MensalidadeRepository implements IMensalidadeRepository {
  async criar(data: any) {
    return prisma.mensalidade.create({
      data,
      include: {
        aluno: true,
        matricula: true,
      },
    });
  }

  async criarVarias(data: any[]) {
    return prisma.mensalidade.createMany({ data });
  }

  async buscarPorId(id: string) {
    return prisma.mensalidade.findUnique({
      where: { id },
      include: {
        aluno: {
          include: {
            responsavel: true,
          },
        },
        matricula: {
          include: {
            plano: true,
          },
        },
      },
    });
  }

  async buscarPorAluno(alunoId: string) {
    return prisma.mensalidade.findMany({
      where: { alunoId },
      include: {
        matricula: {
          include: {
            plano: true,
          },
        },
      },
      orderBy: [{ anoReferencia: 'desc' }, { mesReferencia: 'desc' }],
    });
  }

  async buscarPorMatricula(matriculaId: string) {
    return prisma.mensalidade.findMany({
      where: { matriculaId },
      orderBy: [{ anoReferencia: 'asc' }, { mesReferencia: 'asc' }],
    });
  }

  async buscarPendentes() {
    return prisma.mensalidade.findMany({
      where: { status: 'PENDENTE' },
      include: {
        aluno: {
          include: {
            responsavel: true,
          },
        },
      },
      orderBy: { dataVencimento: 'asc' },
    });
  }

  async buscarAtrasadas() {
    return prisma.mensalidade.findMany({
      where: {
        OR: [
          { status: 'ATRASADO' },
          {
            status: 'PENDENTE',
            dataVencimento: { lt: new Date() },
          },
        ],
      },
      include: {
        aluno: {
          include: {
            responsavel: true,
          },
        },
      },
      orderBy: { dataVencimento: 'asc' },
    });
  }

  async buscarPorMesAno(mes: number, ano: number) {
    return prisma.mensalidade.findMany({
      where: {
        mesReferencia: mes,
        anoReferencia: ano,
      },
      include: {
        aluno: true,
      },
      orderBy: { aluno: { nome: 'asc' } },
    });
  }

  async registrarPagamento(id: string, data: any) {
    return prisma.mensalidade.update({
      where: { id },
      data: {
        valorPago: data.valorPago,
        dataPagamento: data.dataPagamento || new Date(),
        formaPagamento: data.formaPagamento,
        status: 'PAGO',
      },
    });
  }

  async atualizar(id: string, data: any) {
    return prisma.mensalidade.update({
      where: { id },
      data,
    });
  }
}
