import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { PageHeader } from '../../../shared/components/PageHeader';
import { VantagemForm } from '../components/VantagemForm';
import { getVantagem, updateVantagem } from '../services/vantagemService';
import type { CreateVantagemInput, Vantagem } from '../types/vantagem';

export function VantagemEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vantagem, setVantagem] = useState<Vantagem | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getVantagem(id)
      .then(setVantagem)
      .catch((err) => setError(err instanceof Error ? err.message : 'Nao foi possivel carregar a vantagem'));
  }, [id]);

  async function handleSubmit(input: CreateVantagemInput) {
    if (!id) return;
    await updateVantagem(id, input);
    navigate('/vantagens');
  }

  return (
    <section className="stack">
      <PageHeader
        title="Editar vantagem"
        description="Altere os dados da vantagem."
        actions={
          <Link className="button button--secondary" to="/vantagens">
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </Link>
        }
      />
      {error ? <Alert tone="error">{error}</Alert> : null}
      <section className="work-panel">
        {vantagem ? (
          <VantagemForm
            initialValue={{
              title: vantagem.title,
              description: vantagem.description,
              imageUrl: vantagem.imageUrl ?? '',
              costInCoins: vantagem.costInCoins
            }}
            submitLabel="Salvar alteracoes"
            onSubmit={handleSubmit}
          />
        ) : !error ? (
          <div className="empty-state">Carregando...</div>
        ) : null}
      </section>
    </section>
  );
}
