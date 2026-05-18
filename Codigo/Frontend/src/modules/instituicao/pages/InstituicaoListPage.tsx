import { Edit3, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SearchInput } from '../../../shared/components/SearchInput';
import { deleteInstituicao, listInstituicoes } from '../services/instituicaoService';
import type { Instituicao } from '../types/instituicao';

export function InstituicaoListPage() {
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

  async function handleDeleteConfirmed() {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
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

  const filtered = instituicoes.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      {confirmDeleteId && (
        <ConfirmModal
          title="Remover instituicao"
          message="Deseja remover esta instituicao? A acao nao pode ser desfeita."
          confirmLabel="Remover"
          danger
          onConfirm={() => void handleDeleteConfirmed()}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
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

      <div className="work-panel" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchInput value={query} onChange={setQuery} placeholder="Buscar por nome..." />
      </div>

      <div className="table-card">
        {loading ? (
          <div className="empty-state">Carregando instituicoes...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <strong>{instituicoes.length === 0 ? 'Nenhuma instituicao cadastrada' : 'Nenhum resultado para a busca'}</strong>
            <span>{instituicoes.length === 0 ? 'Cadastre uma instituicao para liberar o cadastro de alunos.' : 'Tente outros termos.'}</span>
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
                {filtered.map((instituicao) => (
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
                        <button className="icon-button icon-button--danger" type="button" onClick={() => setConfirmDeleteId(instituicao.id)} aria-label="Remover instituicao">
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
    </>
  );
}
