import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar escola padrão
  const escola = await prisma.escola.upsert({
    where: { cnpj: '00.000.000/0001-00' },
    update: {},
    create: {
      nome: 'Escola Modelo',
      cnpj: '00.000.000/0001-00',
      telefone: '(11) 1234-5678',
      email: 'contato@escolamodelo.com.br',
      endereco: 'Rua da Educação, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
      diretor: 'Dr. João Silva',
      secretario: 'Maria Santos',
    },
  });
  console.log('✅ Escola criada:', escola.nome);

  // Criar usuário admin (Diretor)
  const senhaHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@escola.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@escola.com',
      senha: senhaHash,
      perfil: 'DIRETOR',
      ativo: true,
    },
  });
  console.log('✅ Usuário admin criado:', admin.email);

  // Criar usuário secretário
  const secretario = await prisma.usuario.upsert({
    where: { email: 'secretario@escola.com' },
    update: {},
    create: {
      nome: 'Secretário',
      email: 'secretario@escola.com',
      senha: senhaHash,
      perfil: 'SECRETARIO',
      ativo: true,
    },
  });
  console.log('✅ Usuário secretário criado:', secretario.email);

  // Criar planos de mensalidade
  const planos = [
    { nome: 'Matrícula', descricao: 'Taxa de matrícula', valor: 150 },
    { nome: 'Integral', descricao: 'Período integral', valor: 600 },
    { nome: 'Vespertino', descricao: 'Período vespertino', valor: 400 },
    { nome: 'Matutino', descricao: 'Período matutino', valor: 400 },
    { nome: 'Promocional Irmãos Integral', descricao: 'Desconto para irmãos - Integral', valor: 1000 },
  ];

  for (const plano of planos) {
    await prisma.planoMensalidade.upsert({
      where: { nome: plano.nome },
      update: {},
      create: plano,
    });
  }
  console.log('✅ Planos de mensalidade criados');

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
