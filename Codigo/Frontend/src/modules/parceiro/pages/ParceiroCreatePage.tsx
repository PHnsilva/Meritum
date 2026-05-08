import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../shared/components/PageHeader';
import { ParceiroForm } from '../components/ParceiroForm';
import { createParceiro } from '../services/parceiroService';
import type { CreateParceiroInput, UpdateParceiroInput } from '../types/parceiro';

export function ParceiroCreatePage() {
  const navigate = useNavigate();

  async function handleSubmit(input: CreateParceiroInput | UpdateParceiroInput) {
    await createParceiro(input as CreateParceiroInput);
    navigate('/parceiros');
  }

  return (
    <section className="stack">
      <PageHeader
        title="Novo parceiro"
        description="Cadastre uma empresa parceira para que ela ofereca vantagens no sistema."
        actions={
          <Link className="button button--secondary" to="/parceiros">
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </Link>
        }
      />
      <section className="work-panel">
        <ParceiroForm onSubmit={handleSubmit} />
      </section>
    </section>
  );
}
