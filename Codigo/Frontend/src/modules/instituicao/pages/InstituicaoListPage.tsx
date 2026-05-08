import { Edit3, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { PageHeader } from '../../../shared/components/PageHeader';
import { deleteInstituicao, listInstituicoes } from '../services/instituicaoService';
import type { Instituicao } from '../types/instituicao';

export function InstituicaoListPage() {
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadInstituicoes() {
    setLoading(true);
    setError('');

    try {
      setInstituicoes(await listInstituicoes());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar instituicoes');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Deseja remover esta instituicao?')) {
      return;
    }

    try {
      await deleteInstituicao(id);
      await loadInstituicoes();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Nao foi possivel remover a instituicao');
    }
  }

  useEffect(() => {
    void loadInstituicoes();
  }, []);

  return (
    <section className="stack">
      <PageHeader
        title="Instituicoes"
        description="Gerencie as instituicoes de ensino disponiveis para vinculo no cadastro de alunos."
        actions={
          <>
            <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={() => void loadInstituicoes()}>
              Atualizar
            </Button>
            <Link className="button button--primary" to="/instituicoes/nova">
              <Plus size={16} />
              <span>Nova instituicao</span>
            </Link>
          </>
        }
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="table-card">
        {loading ? (
          <div className="empty-state">Carregando instituicoes...</div>
        ) : instituicoes.length === 0 ? (
          <div className="empty-state">
            <strong>Nenhuma instituicao cadastrada</strong>
            <span>Cadastre uma instituicao para liberar o cadastro de alunos.</span>
          </div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Instituicao</th>
                  <th>Criada em</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {instituicoes.map((instituicao) => (
                  <tr key={instituicao.id}>
                    <td>
                      <strong>{instituicao.name}</strong>
                      <span>{instituicao.id}</span>
                    </td>
                    <td>{new Date(instituicao.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <div className="table-actions">
                        <Link className="icon-button" to={`/instituicoes/${instituicao.id}/editar`} aria-label="Editar instituicao">
                          <Edit3 size={16} />
                        </Link>
                        <button className="icon-button icon-button--danger" type="button" onClick={() => void handleDelete(instituicao.id)} aria-label="Remover instituicao">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
