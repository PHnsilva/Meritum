import { Menu, School, LogOut, LayoutDashboard, GraduationCap, Building2, Gift, Coins, X, Landmark } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { clearStoredUser, getStoredUser } from '../../modules/auth/services/authService';
import { Button } from '../../shared/components/Button';
import { ThemeToggle } from '../../shared/components/ThemeToggle';

const navItems = [
  { to: '/', label: 'Painel', icon: LayoutDashboard },
  { to: '/instituicoes', label: 'Instituicoes', icon: Landmark },
  { to: '/alunos', label: 'Alunos', icon: GraduationCap },
  { to: '/parceiros', label: 'Parceiros', icon: Building2 },
  { to: '/vantagens', label: 'Vantagens', icon: Gift },
  { to: '/moedas', label: 'Moedas', icon: Coins }
];

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = useMemo(() => getStoredUser(), []);

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
            <NavLink key={item.to} to={item.to}>
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
            <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)}>
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
