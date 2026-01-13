import { prisma } from '../database/prisma';
import { INotaRepository } from '../../domain/repositories/IRepositories';

export class NotaRepository implements INotaRepository {
  async criar(data: any) {
    return prisma.nota.create({
      data,
      include: {
        aluno: true,
        turma: true,
      },
    });
  }

  async buscarPorId(id: string) {
    return prisma.nota.findUnique({
      where: { id },
      include: {
        aluno: true,
        turma: true,
      },
    });
  }

  async buscarPorAluno(alunoId: string) {
    return prisma.nota.findMany({
      where: { alunoId },
      include: {
        turma: true,
      },
      orderBy: [{ disciplina: 'asc' }, { bimestre: 'asc' }],
    });
  }

  async buscarPorTurma(turmaId: string) {
    return prisma.nota.findMany({
      where: { turmaId },
      include: {
        aluno: true,
      },
      orderBy: [{ aluno: { nome: 'asc' } }, { disciplina: 'asc' }, { bimestre: 'asc' }],
    });
  }

  async buscarPorAlunoEBimestre(alunoId: string, bimestre: number) {
    return prisma.nota.findMany({
      where: { alunoId, bimestre },
      include: {
        turma: true,
      },
      orderBy: { disciplina: 'asc' },
    });
  }

  async atualizar(id: string, data: any) {
    return prisma.nota.update({
      where: { id },
      data,
    });
  }

  async deletar(id: string) {
    await prisma.nota.delete({ where: { id } });
  }
}
