import { prisma } from '../database/prisma';
import { IDespesaRepository } from '../../domain/repositories/IRepositories';

export class DespesaRepository implements IDespesaRepository {
  async criar(data: any) {
    return prisma.despesa.create({ data });
  }

  async buscarPorId(id: string) {
    return prisma.despesa.findUnique({ where: { id } });
  }

  async buscarTodas() {
    return prisma.despesa.findMany({
      orderBy: { dataVencimento: 'desc' },
    });
  }

  async buscarPorCategoria(categoria: string) {
    return prisma.despesa.findMany({
      where: { categoria },
      orderBy: { dataVencimento: 'desc' },
    });
  }

  async buscarPorMesAno(mes: number, ano: number) {
    const startDate = new Date(ano, mes - 1, 1);
    const endDate = new Date(ano, mes, 0);

    return prisma.despesa.findMany({
      where: {
        dataVencimento: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { dataVencimento: 'asc' },
    });
  }

  async buscarPendentes() {
    return prisma.despesa.findMany({
      where: { status: 'PENDENTE' },
      orderBy: { dataVencimento: 'asc' },
    });
  }

  async registrarPagamento(id: string, data: Date) {
    return prisma.despesa.update({
      where: { id },
      data: {
        dataPagamento: data,
        status: 'PAGO',
      },
    });
  }

  async atualizar(id: string, data: any) {
    return prisma.despesa.update({
      where: { id },
      data,
    });
  }

  async deletar(id: string) {
    await prisma.despesa.delete({ where: { id } });
  }
}
