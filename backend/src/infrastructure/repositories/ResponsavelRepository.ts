import { prisma } from '../database/prisma';
import { IResponsavelRepository } from '../../domain/repositories/IRepositories';

export class ResponsavelRepository implements IResponsavelRepository {
  async criar(data: any) {
    return prisma.responsavel.create({ data });
  }

  async buscarPorId(id: string) {
    return prisma.responsavel.findUnique({
      where: { id },
      include: { alunos: true },
    });
  }

  async buscarPorCpf(cpf: string) {
    return prisma.responsavel.findUnique({ where: { cpf } });
  }

  async buscarTodos() {
    return prisma.responsavel.findMany({
      include: { alunos: true },
      orderBy: { nome: 'asc' },
    });
  }

  async buscarComFilhos(id: string) {
    return prisma.responsavel.findUnique({
      where: { id },
      include: {
        alunos: {
          include: {
            turma: true,
          },
        },
      },
    });
  }

  async atualizar(id: string, data: any) {
    return prisma.responsavel.update({
      where: { id },
      data,
    });
  }

  async deletar(id: string) {
    await prisma.responsavel.delete({ where: { id } });
  }
}
