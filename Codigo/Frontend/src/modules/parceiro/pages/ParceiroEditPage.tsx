import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { PageHeader } from '../../../shared/components/PageHeader';
import { formatCnpj } from '../../../shared/utils/formatters';
import { ParceiroForm } from '../components/ParceiroForm';
import { getParceiro, updateParceiro } from '../services/parceiroService';
import type { CreateParceiroInput, Parceiro, UpdateParceiroInput } from '../types/parceiro';

export function ParceiroEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [parceiro, setParceiro] = useState<Parceiro | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadParceiro() {
      if (!id) {
        return;
      }

      try {
        setParceiro(await getParceiro(id));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar a empresa parceira');
      }
    }

    void loadParceiro();
  }, [id]);

  async function handleSubmit(input: CreateParceiroInput | UpdateParceiroInput) {
    if (!id) {
      return;
    }

    await updateParceiro(id, input);
    navigate('/parceiros');
  }

  return (
    <section className="stack">
      <PageHeader
        title="Editar parceiro"
        description="Atualize os dados cadastrais e a senha opcional da empresa parceira."
        actions={
          <Link className="button button--secondary" to="/parceiros">
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </Link>
        }
      />
      <section className="work-panel">
        {error ? <Alert tone="error">{error}</Alert> : null}
        {!error && !parceiro ? <div className="empty-state">Carregando parceiro...</div> : null}
        {parceiro ? (
          <ParceiroForm
            initialValue={{
              corporateName: parceiro.corporateName,
              tradeName: parceiro.tradeName ?? '',
              email: parceiro.email,
              cnpj: formatCnpj(parceiro.cnpj),
              address: parceiro.address
            }}
            submitLabel="Atualizar parceiro"
            requirePassword={false}
            onSubmit={handleSubmit}
          />
        ) : null}
      </section>
    </section>
  );
}
