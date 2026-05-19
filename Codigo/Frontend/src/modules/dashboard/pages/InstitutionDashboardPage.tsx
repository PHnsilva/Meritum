import { GraduationCap, BookOpen, Landmark, UserCog } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../shared/components/PageHeader';
import { StatCard } from '../../../shared/components/StatCard';
import { getStoredUser } from '../../auth/services/authService';

export function InstitutionDashboardPage() {
  const user = getStoredUser();

  return (
    <section className="stack">
      <PageHeader
        title={`Ola, ${user?.name ?? 'instituicao'}!`}
        description="Acompanhe os alunos e professores vinculados a sua instituicao."
      />

      <div className="stats-grid">
        <StatCard
          label="Instituicao"
          value="Ensino superior"
          icon={<Landmark size={22} />}
          tone="gray"
        />
        <StatCard
          label="Alunos"
          value="Ver lista"
          icon={<GraduationCap size={22} />}
          tone="green"
        />
        <StatCard
          label="Professores"
          value="Ver lista"
          icon={<BookOpen size={22} />}
          tone="blue"
        />
      </div>

      <section className="work-panel">
        <div>
          <p className="eyebrow">Acesso rapido</p>
          <h2>O que voce pode fazer</h2>
          <span>
            Visualize os alunos e professores vinculados a sua instituicao e mantenha seu perfil atualizado.
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <Link className="button button--primary" to="/alunos">
            <GraduationCap size={16} />
            <span>Alunos</span>
          </Link>
          <Link className="button button--secondary" to="/professores">
            <BookOpen size={16} />
            <span>Professores</span>
          </Link>
          <Link className="button button--secondary" to="/perfil">
            <UserCog size={16} />
            <span>Meu perfil</span>
          </Link>
        </div>
      </section>
    </section>
  );
}
