import { prisma } from '../database/prisma';
import { IPlanoMensalidadeRepository } from '../../domain/repositories/IRepositories';

export class PlanoMensalidadeRepository implements IPlanoMensalidadeRepository {
  async criar(data: any) {
    return prisma.planoMensalidade.create({ data });
  }

  async buscarPorId(id: string) {
    return prisma.planoMensalidade.findUnique({ where: { id } });
  }

  async buscarPorNome(nome: string) {
    return prisma.planoMensalidade.findUnique({ where: { nome } });
  }

  async buscarTodos() {
    return prisma.planoMensalidade.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  async buscarAtivos() {
    return prisma.planoMensalidade.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    });
  }

  async atualizar(id: string, data: any) {
    return prisma.planoMensalidade.update({
      where: { id },
      data,
    });
  }

  async deletar(id: string) {
    await prisma.planoMensalidade.delete({ where: { id } });
  }
}
