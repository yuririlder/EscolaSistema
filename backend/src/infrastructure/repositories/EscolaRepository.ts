import { prisma } from '../database/prisma';
import { IEscolaRepository } from '../../domain/repositories/IRepositories';

export class EscolaRepository implements IEscolaRepository {
  async criar(data: any) {
    return prisma.escola.create({ data });
  }

  async buscarPrimeira() {
    return prisma.escola.findFirst();
  }

  async atualizar(id: string, data: any) {
    return prisma.escola.update({
      where: { id },
      data,
    });
  }
}
