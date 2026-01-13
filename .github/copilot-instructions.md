# Sistema de Gestão Escolar - Copilot Instructions

## Arquitetura
- **Backend**: Node.js + Express + TypeScript com Clean Architecture
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Database**: SQLite com Prisma ORM
- **Autenticação**: JWT com controle de perfis (Diretor, Secretario, Coordenador)

## Estrutura do Projeto
```
/backend
  /src
    /domain         # Entidades e regras de negócio
    /application    # Casos de uso
    /infrastructure # Banco de dados, repositórios
    /interfaces     # Controllers, rotas, middlewares
/frontend
  /src
    /components     # Componentes reutilizáveis
    /pages          # Páginas da aplicação
    /contexts       # Context API
    /services       # Chamadas API
    /hooks          # Custom hooks
    /utils          # Funções utilitárias
```

## Convenções
- Nomes de métodos em português (quando fizer sentido para o domínio)
- Seguir princípios SOLID
- Reaproveitamento de código via componentes e hooks
- Clean Architecture: dependências apontam para dentro

## Funcionalidades
1. Gestão de Usuários com Permissões
2. Cadastro de Professores (funcionário + contratação)
3. Cadastro de Turmas (vínculo com professores)
4. Cadastro de Pais (vínculo com filhos)
5. Cadastro de Alunos (vínculo com pai e turma única)
6. Lançamento de Notas por aluno
7. Gestão Financeira (mensalidades, matrículas, despesas)
8. Pagamento de Funcionários
9. Dashboards e Métricas
10. Documentos para Impressão
