import { prisma } from '../database/prisma';
import { IFuncionarioRepository } from '../../domain/repositories/IRepositories';

export class FuncionarioRepository implements IFuncionarioRepository {
  async criar(data: any) {
    return prisma.funcionario.create({ data });
  }

  async buscarPorId(id: string) {
    return prisma.funcionario.findUnique({
      where: { id },
      include: { professor: true },
    });
  }

  async buscarPorCpf(cpf: string) {
    return prisma.funcionario.findUnique({ where: { cpf } });
  }

  async buscarTodos() {
    return prisma.funcionario.findMany({
      include: { professor: true },
      orderBy: { nome: 'asc' },
    });
  }

  async buscarAtivos() {
    return prisma.funcionario.findMany({
      where: { ativo: true },
      include: { professor: true },
      orderBy: { nome: 'asc' },
    });
  }

  async atualizar(id: string, data: any) {
    return prisma.funcionario.update({
      where: { id },
      data,
    });
  }

  async deletar(id: string) {
    await prisma.funcionario.delete({ where: { id } });
  }
}
