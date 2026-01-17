import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores';
import { useLogout } from '../hooks';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  Users2,
  ClipboardList,
  DollarSign,
  Building,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ElementType;
  children?: { path: string; label: string }[];
}

const menuItems: MenuItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/escola', label: 'Escola', icon: Building },
  { path: '/usuarios', label: 'Usuários', icon: Users },
  { path: '/professores', label: 'Professores', icon: GraduationCap },
  { path: '/turmas', label: 'Turmas', icon: BookOpen },
  { path: '/responsaveis', label: 'Responsáveis', icon: UserCheck },
  { path: '/alunos', label: 'Alunos', icon: Users2 },
  { path: '/notas', label: 'Notas', icon: ClipboardList },
  {
    path: '/financeiro',
    label: 'Financeiro',
    icon: DollarSign,
    children: [
      { path: '/planos-mensalidade', label: 'Planos de Mensalidade' },
      { path: '/matriculas', label: 'Matrículas' },
      { path: '/mensalidades', label: 'Mensalidades' },
      { path: '/despesas', label: 'Despesas' },
      { path: '/pagamentos-funcionarios', label: 'Pagamentos de Funcionários' },
    ],
  },
];

export function Layout() {
  const { usuario } = useAuthStore();
  const logout = useLogout();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [financeiroOpen, setFinanceiroOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;
  const isFinanceiroActive = () =>
    ['/planos-mensalidade', '/matriculas', '/mensalidades', '/despesas', '/pagamentos-funcionarios'].some(
      (p) => location.pathname === p
    );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white shadow-lg transition-all duration-300 flex flex-col fixed h-full z-20`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {sidebarOpen && (
            <span className="text-xl font-bold text-primary-600">Escola</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => (
              <li key={item.path}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => setFinanceiroOpen(!financeiroOpen)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        isFinanceiroActive()
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={20} />
                        {sidebarOpen && <span>{item.label}</span>}
                      </div>
                      {sidebarOpen && (
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${
                            financeiroOpen ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </button>
                    {financeiroOpen && sidebarOpen && (
                      <ul className="ml-6 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <li key={child.path}>
                            <Link
                              to={child.path}
                              className={`block px-3 py-2 rounded-lg transition-colors ${
                                isActive(child.path)
                                  ? 'bg-primary-50 text-primary-600'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon size={20} />
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-semibold">
                {usuario?.nome?.charAt(0).toUpperCase()}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {usuario?.nome}
                </p>
                <p className="text-xs text-gray-500 truncate">{usuario?.perfil}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`mt-3 flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors ${
              !sidebarOpen ? 'justify-center' : ''
            }`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}
      >
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
