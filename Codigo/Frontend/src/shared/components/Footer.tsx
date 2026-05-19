import { School } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const navItems = [
    { to: '/', label: 'Portal' },
    { to: '/moedas/extrato/aluno', label: 'Meu Extrato' },
    { to: '/vantagens', label: 'Vantagens' },
    { to: '/perfil', label: 'Minha Conta' },
  ];

  return (
    <footer className="footer">
      <div className="footer__content">
        <div className="footer__brand">
          <School size={24} />
          <div>
            <h4>Meritum</h4>
            <p>Sistema de reconhecimento acadêmico</p>
          </div>
        </div>

        <nav className="footer__nav">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}>{item.label}</Link>
          ))}
        </nav>

        <div className="footer__info">
          <p className="footer__copyright">&copy; {currentYear} Meritum. Todos os direitos reservados.</p>
          <p className="footer__institution">PUC Minas &mdash; Campus Lourdes</p>
        </div>
      </div>
    </footer>
  );
}
