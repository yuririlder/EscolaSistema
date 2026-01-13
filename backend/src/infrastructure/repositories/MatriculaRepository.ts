import { prisma } from '../database/prisma';
import { IMatriculaRepository } from '../../domain/repositories/IRepositories';

export class MatriculaRepository implements IMatriculaRepository {
  async criar(data: any) {
    return prisma.matricula.create({
      data,
      include: {
        aluno: true,
        plano: true,
      },
    });
  }

  async buscarPorId(id: string) {
    return prisma.matricula.findUnique({
      where: { id },
      include: {
        aluno: {
          include: {
            responsavel: true,
            turma: true,
          },
        },
        plano: true,
        mensalidades: true,
      },
    });
  }

  async buscarPorAluno(alunoId: string) {
    return prisma.matricula.findMany({
      where: { alunoId },
      include: {
        plano: true,
        mensalidades: true,
      },
      orderBy: { anoLetivo: 'desc' },
    });
  }

  async buscarAtivas() {
    return prisma.matricula.findMany({
      where: { status: 'ATIVA' },
      include: {
        aluno: {
          include: {
            responsavel: true,
          },
        },
        plano: true,
      },
      orderBy: { dataMatricula: 'desc' },
    });
  }

  async buscarPorAnoLetivo(ano: number) {
    return prisma.matricula.findMany({
      where: { anoLetivo: ano },
      include: {
        aluno: true,
        plano: true,
      },
      orderBy: { dataMatricula: 'desc' },
    });
  }

  async atualizar(id: string, data: any) {
    return prisma.matricula.update({
      where: { id },
      data,
    });
  }

  async cancelar(id: string) {
    return prisma.matricula.update({
      where: { id },
      data: { status: 'CANCELADA' },
    });
  }
}
