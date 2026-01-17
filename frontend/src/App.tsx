import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrivateRoute } from './components/PrivateRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Usuarios } from './pages/Usuarios';
import { Professores } from './pages/Professores';
import { Turmas } from './pages/Turmas';
import { Responsaveis } from './pages/Responsaveis';
import { Alunos } from './pages/Alunos';
import { Notas } from './pages/Notas';
import { PlanosMensalidade } from './pages/PlanosMensalidade';
import { Matriculas } from './pages/Matriculas';
import { Mensalidades } from './pages/Mensalidades';
import { Despesas } from './pages/Despesas';
import { PagamentosFuncionarios } from './pages/PagamentosFuncionarios';
import { Escola } from './pages/Escola';

// Configuração do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      cacheTime: 1000 * 60 * 30, // 30 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="escola" element={<Escola />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="professores" element={<Professores />} />
            <Route path="turmas" element={<Turmas />} />
            <Route path="responsaveis" element={<Responsaveis />} />
            <Route path="alunos" element={<Alunos />} />
            <Route path="notas" element={<Notas />} />
            <Route path="planos-mensalidade" element={<PlanosMensalidade />} />
            <Route path="matriculas" element={<Matriculas />} />
            <Route path="mensalidades" element={<Mensalidades />} />
            <Route path="despesas" element={<Despesas />} />
            <Route path="pagamentos-funcionarios" element={<PagamentosFuncionarios />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
