# 📚 Sistema de Gestão Escolar - Documentação Completa da Arquitetura

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Tecnologias Utilizadas](#tecnologias-utilizadas)
3. [Arquitetura do Sistema](#arquitetura-do-sistema)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [Backend](#backend)
6. [Frontend](#frontend)
7. [Banco de Dados](#banco-de-dados)
8. [APIs e Endpoints](#apis-e-endpoints)
9. [Autenticação e Autorização](#autenticação-e-autorização)
10. [Scripts e Comandos](#scripts-e-comandos)

---

## 🎯 Visão Geral

O **Sistema de Gestão Escolar** é uma aplicação desktop/web completa para gerenciamento de instituições de ensino, desenvolvida com foco em escalabilidade, manutenibilidade e boas práticas de desenvolvimento.

### Principais Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| **Gestão de Usuários** | Controle de acesso com perfis (Diretor, Secretário, Coordenador) |
| **Gestão de Professores** | Cadastro completo com dados de funcionário e contratação |
| **Gestão de Turmas** | Organização de turmas com vínculo a professores e alunos |
| **Gestão de Responsáveis** | Cadastro de pais/responsáveis com vínculo aos filhos |
| **Gestão de Alunos** | Cadastro completo com vínculo a responsável e turma |
| **Lançamento de Notas** | Sistema de notas por bimestre e disciplina |
| **Gestão Financeira** | Matrículas, mensalidades, despesas |
| **Pagamento de Funcionários** | Controle de folha de pagamento |
| **Dashboard** | Métricas e indicadores em tempo real |
| **Documentos** | Geração de termos e comprovantes (PDF) |

---

## 🛠 Tecnologias Utilizadas

### Backend

| Tecnologia | Versão | Finalidade |
|------------|--------|------------|
| **Node.js** | LTS | Runtime JavaScript server-side |
| **Express** | ^4.18.2 | Framework web minimalista |
| **TypeScript** | ^5.3.3 | Tipagem estática |
| **PostgreSQL** | - | Banco de dados relacional (Railway) |
| **pg** | ^8.11.3 | Driver PostgreSQL para Node.js |
| **JWT** | ^9.0.2 | Autenticação via tokens |
| **bcryptjs** | ^2.4.3 | Criptografia de senhas |
| **express-validator** | ^7.0.1 | Validação de dados |
| **winston** | ^3.11.0 | Sistema de logs |
| **pdfkit** | ^0.14.0 | Geração de PDFs |
| **helmet** | ^7.1.0 | Segurança HTTP |
| **cors** | ^2.8.5 | Cross-Origin Resource Sharing |
| **dotenv** | ^16.3.1 | Variáveis de ambiente |
| **ts-node-dev** | ^2.0.0 | Executor TypeScript com hot-reload |

### Frontend

| Tecnologia | Versão | Finalidade |
|------------|--------|------------|
| **Tauri** | ^1.5 | Framework para apps desktop |
| **React** | ^18.2.0 | Biblioteca para construção de UI |
| **TypeScript** | ~5.3.3 | Tipagem estática |
| **Vite** | ^4.5.2 | Build tool e dev server |
| **React Router DOM** | ^6.21.1 | Roteamento SPA |
| **Axios** | ^1.6.3 | Cliente HTTP |
| **Tailwind CSS** | ^3.4.1 | Framework CSS utility-first |
| **Zustand** | ^4.4.7 | Gerenciamento de estado global |
| **React Query** | ^4.36.1 | Cache e sincronização de dados |
| **React Hook Form** | ^7.49.2 | Gerenciamento de formulários |
| **Zod** | ^3.22.4 | Validação de schemas |
| **Lucide React** | ^0.303.0 | Biblioteca de ícones |
| **Recharts** | ^2.10.3 | Biblioteca de gráficos |
| **React Hot Toast** | ^2.4.1 | Notificações toast |
| **date-fns** | ^3.0.6 | Manipulação de datas |

---

## 🏗 Arquitetura do Sistema

### Padrão Arquitetural: Layered Architecture (Arquitetura em Camadas)

O projeto segue a **Arquitetura em Camadas** com separação clara de responsabilidades:

```
┌─────────────────────────────────────────────────────────────┐
│                         ROUTES                               │
│              Define endpoints e aplica middlewares           │
├─────────────────────────────────────────────────────────────┤
│                       MIDDLEWARES                            │
│         Autenticação, Validação, Tratamento de erros         │
├─────────────────────────────────────────────────────────────┤
│                       CONTROLLERS                            │
│          Recebe requisições e retorna respostas              │
├─────────────────────────────────────────────────────────────┤
│                        SERVICES                              │
│              Lógica de negócio e regras                      │
├─────────────────────────────────────────────────────────────┤
│                        DATABASE                              │
│         Conexão PostgreSQL, Migrations, Queries              │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo de uma Requisição

```
Request → Routes → Middlewares → Controller → Service → Database
                                                    ↓
Response ← Routes ← Middlewares ← Controller ← Service ← Result
```

---

## 📁 Estrutura do Projeto

```
/backend
  /src
    /database           # Configuração do banco de dados
      connection.ts     # Pool de conexões PostgreSQL
      migrate.ts        # Sistema de migrations
      seed.ts           # Dados iniciais
      /migrations       # Arquivos de migration
    /types              # Tipos TypeScript e interfaces
      index.ts
    /utils              # Funções utilitárias
      logger.ts         # Sistema de logs (Winston)
      response.ts       # Padronização de respostas
      formatters.ts     # Formatação de dados (CPF, CNPJ, etc)
    /services           # Lógica de negócio
      authService.ts
      usuarioService.ts
      escolaService.ts
      alunoService.ts
      responsavelService.ts
      turmaService.ts
      professorService.ts
      notaService.ts
      financeiroService.ts
    /controllers        # Controladores HTTP
      authController.ts
      usuarioController.ts
      escolaController.ts
      alunoController.ts
      responsavelController.ts
      turmaController.ts
      professorController.ts
      notaController.ts
      financeiroController.ts
    /middlewares        # Middlewares Express
      authMiddleware.ts
      validateMiddleware.ts
      errorHandler.ts
    /routes             # Definição de rotas
      authRoutes.ts
      usuarioRoutes.ts
      escolaRoutes.ts
      alunoRoutes.ts
      responsavelRoutes.ts
      turmaRoutes.ts
      professorRoutes.ts
      notaRoutes.ts
      financeiroRoutes.ts
      index.ts
    server.ts           # Ponto de entrada

/frontend
  /src
    /components         # Componentes React reutilizáveis
      /ui               # Componentes de UI base
      Layout.tsx
      PrivateRoute.tsx
    /pages              # Páginas da aplicação
      Dashboard.tsx
      Login.tsx
      Usuarios.tsx
      Professores.tsx
      Turmas.tsx
      Responsaveis.tsx
      Alunos.tsx
      Notas.tsx
      PlanosMensalidade.tsx
      Matriculas.tsx
      Mensalidades.tsx
      Despesas.tsx
      PagamentosFuncionarios.tsx
      Escola.tsx
    /stores             # Estado global (Zustand)
      authStore.ts
      uiStore.ts
    /hooks              # Custom hooks (React Query)
      useAuth.ts
      useUsuarios.ts
      useAlunos.ts
      useTurmas.ts
      useProfessores.ts
      useResponsaveis.ts
      useNotas.ts
      useFinanceiro.ts
      useEscola.ts
    /services           # Serviços de API
      api.ts            # Configuração Axios
    /types              # Tipos TypeScript
  /src-tauri            # Configuração Tauri
    tauri.conf.json
    Cargo.toml
    /src
      main.rs
```

---

## 🔧 Backend

### Database Connection

O sistema utiliza PostgreSQL hospedado no Railway com pool de conexões:

```typescript
// database/connection.ts
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000
});
```

### Sistema de Migrations

Migrations customizadas com versionamento:

```typescript
// database/migrate.ts
export async function runMigrations() {
  // Cria tabela de controle de migrations
  // Executa migrations pendentes em ordem
  // Registra migrations executadas
}
```

### Estrutura de um Service

```typescript
// services/alunoService.ts
export const alunoService = {
  async listar(): Promise<Aluno[]> {
    const result = await pool.query('SELECT * FROM alunos WHERE ativo = true');
    return result.rows;
  },
  
  async criar(data: CreateAlunoDTO): Promise<Aluno> {
    // Validações de negócio
    // Insert no banco
    // Retorno do registro criado
  },
  // ...
};
```

### Estrutura de um Controller

```typescript
// controllers/alunoController.ts
export const alunoController = {
  async listar(req: Request, res: Response) {
    try {
      const alunos = await alunoService.listar();
      return successResponse(res, alunos);
    } catch (error) {
      return errorResponse(res, error);
    }
  },
  // ...
};
```

### Padronização de Respostas

```typescript
// Sucesso
{
  "success": true,
  "data": { ... }
}

// Erro
{
  "success": false,
  "message": "Descrição do erro",
  "errors": [] // opcional
}
```

---

## 🎨 Frontend

### Gerenciamento de Estado (Zustand)

```typescript
// stores/authStore.ts
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      isAuthenticated: false,
      setAuth: (token, usuario) => set({ token, usuario, isAuthenticated: true }),
      logout: () => set({ token: null, usuario: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);
```

### Data Fetching (React Query)

```typescript
// hooks/useAlunos.ts
export function useAlunos() {
  return useQuery({
    queryKey: ['alunos'],
    queryFn: async () => {
      const response = await api.get('/alunos');
      return response.data.data;
    },
  });
}

export function useCreateAluno() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/alunos', data),
    onSuccess: () => queryClient.invalidateQueries(['alunos']),
  });
}
```

### Formulários (React Hook Form + Zod)

```typescript
// pages/Login.tsx
const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Mínimo 6 caracteres'),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(loginSchema),
});
```

### Tauri (Desktop App)

Configuração em `src-tauri/tauri.conf.json`:
- Permissões de sistema (fs, dialog, http)
- Janela principal (1200x800)
- Bundle para Windows/Mac/Linux

---

## 🗄 Banco de Dados

### PostgreSQL no Railway

**URL de Conexão:**
```
postgres://postgres:***@nozomi.proxy.rlwy.net:37880/railway
```

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `escola` | Dados da instituição |
| `usuarios` | Usuários do sistema |
| `funcionarios` | Dados de funcionários |
| `professores` | Extensão de funcionários |
| `responsaveis` | Pais/Responsáveis |
| `alunos` | Alunos da escola |
| `turmas` | Turmas disponíveis |
| `turma_professor` | Vínculo N:N turma-professor |
| `notas` | Notas dos alunos |
| `planos_mensalidade` | Planos de pagamento |
| `matriculas` | Matrículas de alunos |
| `mensalidades` | Parcelas mensais |
| `despesas` | Despesas da escola |
| `pagamentos_funcionarios` | Folha de pagamento |

---

## 🔐 APIs e Endpoints

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Usuário atual |

### Usuários
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/usuarios` | Listar |
| POST | `/api/usuarios` | Criar |
| GET | `/api/usuarios/:id` | Buscar |
| PUT | `/api/usuarios/:id` | Atualizar |
| DELETE | `/api/usuarios/:id` | Deletar |
| PATCH | `/api/usuarios/:id/senha` | Alterar senha |

### Alunos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/alunos` | Listar |
| POST | `/api/alunos` | Criar |
| GET | `/api/alunos/:id` | Buscar |
| PUT | `/api/alunos/:id` | Atualizar |
| DELETE | `/api/alunos/:id` | Deletar |
| POST | `/api/alunos/:id/vincular-turma` | Vincular turma |

### Turmas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/turmas` | Listar |
| POST | `/api/turmas` | Criar |
| GET | `/api/turmas/:id` | Buscar |
| GET | `/api/turmas/:id/alunos` | Listar alunos |
| GET | `/api/turmas/:id/professores` | Listar professores |

### Notas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/notas` | Listar |
| POST | `/api/notas` | Lançar |
| GET | `/api/notas/aluno/:alunoId` | Por aluno |
| GET | `/api/notas/aluno/:alunoId/boletim` | Boletim |

### Financeiro
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/financeiro/planos` | Planos |
| POST | `/api/financeiro/matriculas` | Nova matrícula |
| GET | `/api/financeiro/mensalidades` | Mensalidades |
| POST | `/api/financeiro/mensalidades/:id/pagar` | Pagar |
| GET | `/api/financeiro/dashboard` | Dashboard |

---

## 🔒 Autenticação e Autorização

### Perfis de Usuário

| Perfil | Permissões |
|--------|------------|
| **DIRETOR** | Acesso total ao sistema |
| **SECRETARIO** | Cadastros, matrículas, financeiro |
| **COORDENADOR** | Visualização, notas |

### Middlewares de Proteção

```typescript
// Requer autenticação
router.use(authMiddleware);

// Requer perfil específico
router.use(requireDiretor);
router.use(requireDiretorOuSecretario);
```

### Usuário Padrão

```
Email: admin@escola.com
Senha: admin123
Perfil: DIRETOR
```

---

## 📜 Scripts e Comandos

### Backend

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Executar migrations
npm run migrate

# Executar seed
npm run seed

# Produção
npm start
```

### Frontend

```bash
# Desenvolvimento web
npm run dev

# Build web
npm run build

# Desenvolvimento Tauri (desktop)
npm run tauri:dev

# Build Tauri (desktop)
npm run tauri:build
```

---

## 📝 Variáveis de Ambiente

### Backend (.env)

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgres://user:pass@host:port/db
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 🚀 Deploy

### Backend
- Railway, Render, ou VPS
- Configurar variáveis de ambiente
- PostgreSQL Railway já configurado

### Frontend (Web)
- Vercel, Netlify, ou servidor estático
- Build: `npm run build`
- Servir pasta `dist/`

### Frontend (Desktop)
- Build: `npm run tauri:build`
- Gera instaladores para Windows/Mac/Linux

---

*Última atualização: Janeiro 2025*
