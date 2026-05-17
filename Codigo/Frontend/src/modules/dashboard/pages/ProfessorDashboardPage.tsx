import { BookOpen, Coins, FileText, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../shared/components/PageHeader';
import { StatCard } from '../../../shared/components/StatCard';
import { getStoredUser } from '../../auth/services/authService';

export function ProfessorDashboardPage() {
  const user = getStoredUser();

  return (
    <section className="stack">
      <PageHeader
        title={`Ola, ${user?.name ?? 'professor'}!`}
        description="Gerencie sua distribuicao de moedas e acompanhe o historico de envios."
      />

      <div className="stats-grid">
        <StatCard
          label="Saldo disponivel"
          value={`${user?.coinBalance ?? 0} moedas`}
          icon={<Coins size={22} />}
          tone="green"
        />
      </div>

      <section className="work-panel">
        <div>
          <p className="eyebrow">Acesso rapido</p>
          <h2>O que voce pode fazer</h2>
          <span>Envie moedas para reconhecer o merito dos seus alunos e consulte seu historico de envios.</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <Link className="button button--primary" to="/moedas">
            <Send size={16} />
            <span>Enviar moedas</span>
          </Link>
          <Link className="button button--secondary" to="/moedas/extrato/professor">
            <FileText size={16} />
            <span>Meu extrato</span>
          </Link>
        </div>
      </section>
    </section>
  );
}
