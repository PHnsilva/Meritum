import { Building2, Gift, UserCog } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../shared/components/PageHeader';
import { StatCard } from '../../../shared/components/StatCard';
import { getStoredUser } from '../../auth/services/authService';

export function PartnerDashboardPage() {
  const user = getStoredUser();

  return (
    <section className="stack">
      <PageHeader
        title={`Ola, ${user?.name ?? 'parceiro'}!`}
        description="Gerencie sua presenca no sistema e prepare suas vantagens para os alunos."
      />

      <div className="stats-grid">
        <StatCard
          label="Perfil"
          value="Empresa parceira"
          icon={<Building2 size={22} />}
          tone="gray"
        />
        <StatCard
          label="Vantagens"
          value="Gerenciar"
          icon={<Gift size={22} />}
          tone="green"
        />
      </div>

      <section className="work-panel">
        <div>
          <p className="eyebrow">Acesso rapido</p>
          <h2>O que voce pode fazer</h2>
          <span>
            Mantenha os dados da sua empresa atualizados e cadastre vantagens para alunos resgatarem com suas moedas.
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <Link className="button button--primary" to="/perfil">
            <UserCog size={16} />
            <span>Meu perfil</span>
          </Link>
          <Link className="button button--secondary" to="/vantagens">
            <Gift size={16} />
            <span>Vantagens</span>
          </Link>
        </div>
      </section>
    </section>
  );
}
