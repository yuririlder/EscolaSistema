import { prisma } from '../database/prisma';
import { IUsuarioRepository } from '../../domain/repositories/IRepositories';

export class UsuarioRepository implements IUsuarioRepository {
  async criar(data: any) {
    return prisma.usuario.create({ data });
  }

  async buscarPorId(id: string) {
    return prisma.usuario.findUnique({ where: { id } });
  }

  async buscarPorEmail(email: string) {
    return prisma.usuario.findUnique({ where: { email } });
  }

  async buscarTodos() {
    return prisma.usuario.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  async atualizar(id: string, data: any) {
    return prisma.usuario.update({
      where: { id },
      data,
    });
  }

  async deletar(id: string) {
    await prisma.usuario.delete({ where: { id } });
  }
}
