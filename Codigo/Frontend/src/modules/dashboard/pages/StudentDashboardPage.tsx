import { Coins, FileText, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../shared/components/PageHeader';
import { StatCard } from '../../../shared/components/StatCard';
import { getStoredUser } from '../../auth/services/authService';

export function StudentDashboardPage() {
  const user = getStoredUser();

  return (
    <section className="stack">
      <PageHeader
        title={`Ola, ${user?.name ?? 'aluno'}!`}
        description="Acompanhe seu saldo de moedas, historico de recebimentos e vantagens disponiveis."
      />

      <div className="stats-grid">
        <StatCard
          label="Saldo atual"
          value={`${user?.coinBalance ?? 0} moedas`}
          icon={<Coins size={22} />}
          tone="green"
        />
      </div>

      <section className="work-panel">
        <div>
          <p className="eyebrow">Acesso rapido</p>
          <h2>O que voce pode fazer</h2>
          <span>Consulte seu historico de moedas recebidas e troque por vantagens nas empresas parceiras.</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <Link className="button button--primary" to="/moedas/extrato/aluno">
            <FileText size={16} />
            <span>Ver meu extrato</span>
          </Link>
          <Link className="button button--secondary" to="/vantagens">
            <Gift size={16} />
            <span>Ver vantagens</span>
          </Link>
        </div>
      </section>
    </section>
  );
}
