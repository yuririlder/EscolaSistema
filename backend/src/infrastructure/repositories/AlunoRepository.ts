import { prisma } from '../database/prisma';
import { IAlunoRepository } from '../../domain/repositories/IRepositories';

export class AlunoRepository implements IAlunoRepository {
  async criar(data: any) {
    return prisma.aluno.create({
      data,
      include: {
        responsavel: true,
        turma: true,
      },
    });
  }

  async buscarPorId(id: string) {
    return prisma.aluno.findUnique({
      where: { id },
      include: {
        responsavel: true,
        turma: true,
        matriculas: {
          include: { plano: true },
        },
      },
    });
  }

  async buscarPorCpf(cpf: string) {
    return prisma.aluno.findUnique({
      where: { cpf },
      include: {
        responsavel: true,
        turma: true,
      },
    });
  }

  async buscarTodos() {
    return prisma.aluno.findMany({
      include: {
        responsavel: true,
        turma: true,
      },
      orderBy: { nome: 'asc' },
    });
  }

  async buscarPorResponsavel(responsavelId: string) {
    return prisma.aluno.findMany({
      where: { responsavelId },
      include: {
        turma: true,
      },
      orderBy: { nome: 'asc' },
    });
  }

  async buscarPorTurma(turmaId: string) {
    return prisma.aluno.findMany({
      where: { turmaId },
      include: {
        responsavel: true,
      },
      orderBy: { nome: 'asc' },
    });
  }

  async buscarMatriculados() {
    return prisma.aluno.findMany({
      where: { matriculaAtiva: true },
      include: {
        responsavel: true,
        turma: true,
      },
      orderBy: { nome: 'asc' },
    });
  }

  async vincularTurma(alunoId: string, turmaId: string) {
    return prisma.aluno.update({
      where: { id: alunoId },
      data: { turmaId },
    });
  }

  async desvincularTurma(alunoId: string) {
    return prisma.aluno.update({
      where: { id: alunoId },
      data: { turmaId: null },
    });
  }

  async atualizar(id: string, data: any) {
    return prisma.aluno.update({
      where: { id },
      data,
      include: {
        responsavel: true,
        turma: true,
      },
    });
  }

  async deletar(id: string) {
    await prisma.aluno.delete({ where: { id } });
  }
}
