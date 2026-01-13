import { prisma } from '../database/prisma';
import { ITurmaRepository } from '../../domain/repositories/IRepositories';

export class TurmaRepository implements ITurmaRepository {
  async criar(data: any) {
    return prisma.turma.create({ data });
  }

  async buscarPorId(id: string) {
    return prisma.turma.findUnique({
      where: { id },
      include: {
        alunos: true,
        professores: {
          include: {
            professor: {
              include: {
                funcionario: true,
              },
            },
          },
        },
      },
    });
  }

  async buscarTodas() {
    return prisma.turma.findMany({
      include: {
        _count: {
          select: { alunos: true },
        },
      },
      orderBy: [{ ano: 'desc' }, { nome: 'asc' }],
    });
  }

  async buscarAtivas() {
    return prisma.turma.findMany({
      where: { ativa: true },
      include: {
        _count: {
          select: { alunos: true },
        },
      },
      orderBy: [{ ano: 'desc' }, { nome: 'asc' }],
    });
  }

  async buscarComAlunos(id: string) {
    return prisma.turma.findUnique({
      where: { id },
      include: {
        alunos: {
          include: {
            responsavel: true,
          },
          orderBy: { nome: 'asc' },
        },
      },
    });
  }

  async buscarComProfessores(id: string) {
    return prisma.turma.findUnique({
      where: { id },
      include: {
        professores: {
          include: {
            professor: {
              include: {
                funcionario: true,
              },
            },
          },
        },
      },
    });
  }

  async atualizar(id: string, data: any) {
    return prisma.turma.update({
      where: { id },
      data,
    });
  }

  async deletar(id: string) {
    await prisma.turma.delete({ where: { id } });
  }
}
