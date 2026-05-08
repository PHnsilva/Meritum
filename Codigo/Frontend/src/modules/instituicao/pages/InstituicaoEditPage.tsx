import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { PageHeader } from '../../../shared/components/PageHeader';
import { InstituicaoForm } from '../components/InstituicaoForm';
import { getInstituicao, updateInstituicao } from '../services/instituicaoService';
import type { CreateInstituicaoInput, Instituicao } from '../types/instituicao';

export function InstituicaoEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [instituicao, setInstituicao] = useState<Instituicao | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadInstituicao() {
      if (!id) {
        return;
      }

      try {
        setInstituicao(await getInstituicao(id));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar a instituicao');
      }
    }

    void loadInstituicao();
  }, [id]);

  async function handleSubmit(input: CreateInstituicaoInput) {
    if (!id) {
      return;
    }

    await updateInstituicao(id, input);
    navigate('/instituicoes');
  }

  return (
    <section className="stack">
      <PageHeader
        title="Editar instituicao"
        description="Atualize o nome exibido para selecao no cadastro de alunos."
        actions={
          <Link className="button button--secondary" to="/instituicoes">
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </Link>
        }
      />
      <section className="work-panel">
        {error ? <Alert tone="error">{error}</Alert> : null}
        {!error && !instituicao ? <div className="empty-state">Carregando instituicao...</div> : null}
        {instituicao ? (
          <InstituicaoForm
            initialValue={{ name: instituicao.name }}
            submitLabel="Atualizar instituicao"
            onSubmit={handleSubmit}
          />
        ) : null}
      </section>
    </section>
  );
}
