import { CheckCircle, Clock, Edit3, FileText, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SearchInput } from '../../../shared/components/SearchInput';
import { approveInstituicao, deleteInstituicao, listInstituicoesAdmin } from '../services/instituicaoService';
import type { Instituicao } from '../types/instituicao';

type Tab = 'all' | 'pending' | 'approved';

export function InstituicaoListPage() {
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [approving, setApproving] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function loadInstituicoes(currentTab: Tab = tab) {
    setLoading(true);
    setError('');
    try {
      const status = currentTab === 'pending' ? 'PENDING' : currentTab === 'approved' ? 'APPROVED' : undefined;
      setInstituicoes(await listInstituicoesAdmin(status));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar instituicoes');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: string) {
    setApproving(id);
    setError('');
    try {
      await approveInstituicao(id);
      await loadInstituicoes();
    } catch (approveError) {
      setError(approveError instanceof Error ? approveError.message : 'Nao foi possivel aprovar a instituicao');
    } finally {
      setApproving(null);
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

  function changeTab(next: Tab) {
    setTab(next);
    void loadInstituicoes(next);
  }

  useEffect(() => {
    void loadInstituicoes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pendingCount = instituicoes.filter((i) => i.status === 'pending').length;
  const q = query.toLowerCase();
  const filtered = instituicoes.filter((i) => i.name.toLowerCase().includes(q));

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
          description="Gerencie as instituicoes de ensino e aprove solicitacoes pendentes."
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

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.25rem' }}>
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar por nome..." />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-line)', marginBottom: '-1px' }}>
          {(['all', 'pending', 'approved'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => changeTab(t)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: tab === t ? '2px solid var(--color-puc-blue)' : '2px solid transparent',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontWeight: tab === t ? 600 : 400,
                color: tab === t ? 'var(--color-puc-blue)' : 'var(--color-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.875rem'
              }}
            >
              {t === 'all' && 'Todas'}
              {t === 'pending' && (
                <>
                  <Clock size={13} />
                  Pendentes
                  {pendingCount > 0 && tab !== 'pending' && (
                    <span style={{ background: '#dc2626', color: '#fff', borderRadius: '9999px', fontSize: '0.7rem', padding: '0 0.375rem', lineHeight: '1.4' }}>
                      {pendingCount}
                    </span>
                  )}
                </>
              )}
              {t === 'approved' && (
                <>
                  <CheckCircle size={13} />
                  Aprovadas
                </>
              )}
            </button>
          ))}
        </div>

        <div className="table-card">
          {loading ? (
            <div className="empty-state">Carregando instituicoes...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <strong>
                {instituicoes.length === 0
                  ? tab === 'pending' ? 'Nenhuma solicitacao pendente' : 'Nenhuma instituicao cadastrada'
                  : 'Nenhum resultado para a busca'}
              </strong>
              <span>
                {instituicoes.length === 0
                  ? tab === 'pending'
                    ? 'Quando instituicoes se cadastrarem pelo link publico, aparecera aqui.'
                    : 'Use o botao nova instituicao para iniciar o cadastro.'
                  : 'Tente outros termos.'}
              </span>
            </div>
          ) : (
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>Instituicao</th>
                    <th>Criada em</th>
                    <th>Status</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inst) => (
                    <tr key={inst.id}>
                      <td>
                        <strong>{inst.name}</strong>
                        <span>{inst.id}</span>
                      </td>
                      <td>{new Date(inst.createdAt).toLocaleDateString('pt-BR')}</td>
                      <td>
                        {inst.status === 'pending' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#fef9c3', color: '#854d0e', borderRadius: '9999px', padding: '0.125rem 0.625rem', fontSize: '0.75rem', fontWeight: 600 }}>
                            <Clock size={11} />
                            Pendente
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#dcfce7', color: '#166534', borderRadius: '9999px', padding: '0.125rem 0.625rem', fontSize: '0.75rem', fontWeight: 600 }}>
                            <CheckCircle size={11} />
                            Aprovada
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="table-actions">
                          {inst.status === 'pending' && (
                            <Button
                              variant="primary"
                              icon={<CheckCircle size={14} />}
                              disabled={approving === inst.id}
                              onClick={() => void handleApprove(inst.id)}
                              style={{ padding: '0.25rem 0.625rem', fontSize: '0.8rem' }}
                            >
                              {approving === inst.id ? 'Aprovando...' : 'Aprovar'}
                            </Button>
                          )}
                          <Link className="icon-button" to={`/instituicoes/${inst.id}/extrato`} aria-label="Ver extrato">
                            <FileText size={16} />
                          </Link>
                          <Link className="icon-button" to={`/instituicoes/${inst.id}/editar`} aria-label="Editar instituicao">
                            <Edit3 size={16} />
                          </Link>
                          <button className="icon-button icon-button--danger" type="button" onClick={() => setConfirmDeleteId(inst.id)} aria-label="Remover instituicao">
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
