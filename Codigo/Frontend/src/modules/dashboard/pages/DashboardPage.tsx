import { Building2, Coins, GraduationCap, HandCoins, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../../shared/components/Button';
import { PageHeader } from '../../../shared/components/PageHeader';
import { StatCard } from '../../../shared/components/StatCard';

export function DashboardPage() {
  return (
    <section className="stack">
      <PageHeader
        title="Painel operacional"
        description="Acompanhe os cadastros base do Meritum e avance para os fluxos de moedas, vantagens e resgates."
        actions={
          <div className="quick-actions">
            <Link className="button button--secondary" to="/instituicoes/nova">
              <Landmark size={16} />
              <span>Nova instituicao</span>
            </Link>
            <Link className="button button--primary" to="/alunos/novo">
              <GraduationCap size={16} />
              <span>Novo aluno</span>
            </Link>
            <Link className="button button--secondary" to="/parceiros/novo">
              <Building2 size={16} />
              <span>Novo parceiro</span>
            </Link>
          </div>
        }
      />

      <div className="stats-grid">
        <StatCard label="Contexto" value="Instituicao" icon={<Landmark size={22} />} />
        <StatCard label="Contexto" value="Aluno" icon={<GraduationCap size={22} />} />
        <StatCard label="Contexto" value="Parceiro" icon={<Building2 size={22} />} tone="gray" />
        <StatCard label="Fluxo previsto" value="Moedas" icon={<Coins size={22} />} tone="green" />
        <StatCard label="Fluxo previsto" value="Resgates" icon={<HandCoins size={22} />} />
      </div>

      <section className="work-panel">
        <div>
          <p className="eyebrow">Proximos passos</p>
          <h2>Cadastros fundamentais</h2>
          <span>
            Instituicoes, alunos e empresas parceiras ja possuem CRUD integrado ao backend. As proximas telas podem
            reutilizar o mesmo padrao para professores, vantagens e extratos.
          </span>
        </div>
        <div className="timeline">
          <div><strong>1</strong><span>Cadastrar instituicoes no banco</span></div>
          <div><strong>2</strong><span>Cadastrar alunos vinculados</span></div>
          <div><strong>3</strong><span>Cadastrar empresas parceiras</span></div>
          <div><strong>4</strong><span>Adicionar vantagens e resgates</span></div>
        </div>
      </section>
    </section>
  );
}
