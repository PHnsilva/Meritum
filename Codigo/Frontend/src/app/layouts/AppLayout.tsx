import { Menu, School, LogOut, LayoutDashboard, GraduationCap, Building2, Gift, Coins, X, Landmark, BookOpen, FileText, UserCog } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { clearStoredUser, getStoredUser } from '../../modules/auth/services/authService';
import { Button } from '../../shared/components/Button';
import { ThemeToggle } from '../../shared/components/ThemeToggle';
import type { UserRole } from '../../shared/types/api';

type NavItem = { to: string; label: string; icon: React.ElementType };

const perfilItem: NavItem = { to: '/perfil', label: 'Minha Conta', icon: UserCog };

const navByRole: Record<UserRole, NavItem[]> = {
  admin: [
    { to: '/', label: 'Painel', icon: LayoutDashboard },
    { to: '/instituicoes', label: 'Instituicoes', icon: Landmark },
    { to: '/alunos', label: 'Alunos', icon: GraduationCap },
    { to: '/professores', label: 'Professores', icon: BookOpen },
    { to: '/parceiros', label: 'Parceiros', icon: Building2 },
    { to: '/moedas', label: 'Enviar Moedas', icon: Coins },
    { to: '/moedas/extrato/professor', label: 'Extrato Prof.', icon: FileText },
    { to: '/moedas/extrato/aluno', label: 'Extrato Aluno', icon: FileText },
    { to: '/vantagens', label: 'Vantagens', icon: Gift },
    perfilItem
  ],
  student: [
    { to: '/', label: 'Painel', icon: LayoutDashboard },
    { to: '/moedas/extrato/aluno', label: 'Meu Extrato', icon: FileText },
    { to: '/vantagens', label: 'Vantagens', icon: Gift },
    perfilItem
  ],
  professor: [
    { to: '/', label: 'Painel', icon: LayoutDashboard },
    { to: '/moedas', label: 'Enviar Moedas', icon: Coins },
    { to: '/moedas/extrato/professor', label: 'Meu Extrato', icon: FileText },
    perfilItem
  ],
  partner: [
    { to: '/', label: 'Painel', icon: LayoutDashboard },
    { to: '/vantagens', label: 'Vantagens', icon: Gift },
    perfilItem
  ]
};

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = useMemo(() => getStoredUser(), []);
  const navItems = user?.role ? (navByRole[user.role] ?? navByRole.admin) : navByRole.admin;

  function handleLogout() {
    clearStoredUser();
    navigate('/login');
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand-strip">
          <div className="brand-mark" aria-label="Meritum">
            <School size={26} />
            <strong>Meritum</strong>
          </div>
          <div className="brand-pattern" aria-hidden="true" />
          <div className="topbar-actions">
            <div className="user-area">
              <strong>{user?.name ?? 'Usuario'}</strong>
              <span>{user?.email ?? 'sessao local'}</span>
            </div>
            <ThemeToggle />
            <button className="icon-button session-logout" type="button" onClick={handleLogout} aria-label="Sair" title="Sair">
              <LogOut size={18} />
            </button>
          </div>
          <button className="icon-button topbar__menu" type="button" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
            <Menu size={22} />
          </button>
        </div>

        <nav className="desktop-nav" aria-label="Navegacao principal">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}>
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <div className={`mobile-drawer ${menuOpen ? 'mobile-drawer--open' : ''}`}>
        <div className="mobile-drawer__panel">
          <button className="icon-button" type="button" onClick={() => setMenuOpen(false)} aria-label="Fechar menu">
            <X size={22} />
          </button>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={() => setMenuOpen(false)}>
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
          <ThemeToggle />
          <Button variant="secondary" icon={<LogOut size={16} />} onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </div>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
