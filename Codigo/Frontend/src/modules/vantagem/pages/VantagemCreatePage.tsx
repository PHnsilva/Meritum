import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../shared/components/PageHeader';
import { VantagemForm } from '../components/VantagemForm';
import { createVantagem } from '../services/vantagemService';
import type { CreateVantagemInput } from '../types/vantagem';

export function VantagemCreatePage() {
  const navigate = useNavigate();

  async function handleSubmit(input: CreateVantagemInput) {
    await createVantagem(input);
    navigate('/vantagens');
  }

  return (
    <section className="stack">
      <PageHeader
        title="Nova vantagem"
        description="Cadastre uma vantagem para oferecer aos alunos em troca de moedas."
        actions={
          <Link className="button button--secondary" to="/vantagens">
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </Link>
        }
      />
      <section className="work-panel">
        <VantagemForm submitLabel="Cadastrar vantagem" onSubmit={handleSubmit} />
      </section>
    </section>
  );
}
