import { prisma } from '../database/prisma';
import { IProfessorRepository } from '../../domain/repositories/IRepositories';

export class ProfessorRepository implements IProfessorRepository {
  async criar(funcionarioId: string, data: any) {
    return prisma.professor.create({
      data: {
        funcionarioId,
        formacao: data.formacao,
        especialidade: data.especialidade,
      },
      include: {
        funcionario: true,
      },
    });
  }

  async buscarPorId(id: string) {
    return prisma.professor.findUnique({
      where: { id },
      include: {
        funcionario: true,
        turmas: {
          include: {
            turma: true,
          },
        },
      },
    });
  }

  async buscarPorFuncionarioId(funcionarioId: string) {
    return prisma.professor.findUnique({
      where: { funcionarioId },
      include: {
        funcionario: true,
        turmas: {
          include: {
            turma: true,
          },
        },
      },
    });
  }

  async buscarTodos() {
    return prisma.professor.findMany({
      include: {
        funcionario: true,
        turmas: {
          include: {
            turma: true,
          },
        },
      },
      orderBy: {
        funcionario: {
          nome: 'asc',
        },
      },
    });
  }

  async atualizar(id: string, data: any) {
    return prisma.professor.update({
      where: { id },
      data,
      include: {
        funcionario: true,
      },
    });
  }

  async deletar(id: string) {
    await prisma.professor.delete({ where: { id } });
  }

  async vincularTurma(professorId: string, turmaId: string, disciplina?: string) {
    return prisma.turmaProfessor.create({
      data: {
        professorId,
        turmaId,
        disciplina,
      },
    });
  }

  async desvincularTurma(professorId: string, turmaId: string) {
    await prisma.turmaProfessor.deleteMany({
      where: {
        professorId,
        turmaId,
      },
    });
  }
}
