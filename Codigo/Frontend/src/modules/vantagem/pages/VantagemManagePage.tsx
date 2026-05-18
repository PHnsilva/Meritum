import { Edit3, Plus, RefreshCw, ShoppingBag, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { Modal } from '../../../shared/components/Modal';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SearchInput } from '../../../shared/components/SearchInput';
import { getStoredUser } from '../../auth/services/authService';
import { deleteVantagem, listMinhasVantagens, listPartnerResgates, listResgatesByVantagem, listTodasVantagens, updateVantagem } from '../services/vantagemService';
import type { Resgate, Vantagem } from '../types/vantagem';

type Tab = 'vantagens' | 'resgates';
type StatusFilter = 'all' | 'active' | 'inactive';

export function VantagemManagePage() {
  const user = getStoredUser();
  const isAdmin = user?.role === 'admin';
  const [tab, setTab] = useState<Tab>('vantagens');
  const [vantagens, setVantagens] = useState<Vantagem[]>([]);
  const [resgates, setResgates] = useState<Resgate[]>([]);
  const [queryV, setQueryV] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [queryR, setQueryR] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [modal, setModal] = useState<{ vantagem: Vantagem; resgates: Resgate[] } | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  async function loadVantagens() {
    setLoading(true);
    setError('');
    try {
      setVantagens(isAdmin ? await listTodasVantagens() : await listMinhasVantagens());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel carregar as vantagens');
    } finally {
      setLoading(false);
    }
  }

  async function loadResgates() {
    setLoading(true);
    setError('');
    try {
      setResgates(await listPartnerResgates());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel carregar os resgates');
    } finally {
      setLoading(false);
    }
  }

  function changeTab(next: Tab) {
    setTab(next);
    if (next === 'vantagens') void loadVantagens();
    else void loadResgates();
  }

  async function handleToggle(v: Vantagem) {
    setToggling(v.id);
    setError('');
    try {
      const updated = await updateVantagem(v.id, { isActive: !v.isActive });
      setVantagens((prev) => prev.map((item) => (item.id === v.id ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel alterar a vantagem');
    } finally {
      setToggling(null);
    }
  }

  async function handleDeleteConfirmed() {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    setError('');
    try {
      await deleteVantagem(id);
      setVantagens((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel remover a vantagem');
    }
  }

  async function handleRowClick(v: Vantagem) {
    setModal({ vantagem: v, resgates: [] });
    setModalLoading(true);
    setModalError('');
    try {
      const list = await listResgatesByVantagem(v.id);
      setModal({ vantagem: v, resgates: list });
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Nao foi possivel carregar os resgates');
    } finally {
      setModalLoading(false);
    }
  }

  useEffect(() => { void loadVantagens(); }, []);

  const qv = queryV.toLowerCase();
  const filteredV = vantagens.filter(
    (v) =>
      v.title.toLowerCase().includes(qv) &&
      (statusFilter === 'all' || (statusFilter === 'active' ? v.isActive : !v.isActive))
  );

  const qr = queryR.toLowerCase();
  const filteredR = resgates.filter(
    (r) => r.student.name.toLowerCase().includes(qr) || r.advantage.title.toLowerCase().includes(qr)
  );

  const tabStyle = (active: boolean): React.CSSProperties => ({
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid var(--color-puc-blue)' : '2px solid transparent',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    fontWeight: active ? 600 : 400,
    color: active ? 'var(--color-puc-blue)' : 'var(--color-muted)',
    fontSize: '0.875rem'
  });

  return (
    <>
      {confirmDeleteId && (
        <ConfirmModal
          title="Remover vantagem"
          message="Deseja remover esta vantagem? A acao nao pode ser desfeita."
          confirmLabel="Remover"
          danger
          onConfirm={() => void handleDeleteConfirmed()}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    <section className="stack">
      <PageHeader
        title={isAdmin ? 'Gerenciar vantagens' : 'Minhas vantagens'}
        description={isAdmin ? 'Visualize, edite e exclua vantagens de todos os parceiros.' : 'Gerencie as vantagens que voce oferece e acompanhe os resgates.'}
        actions={
          <>
            <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={() => void (tab === 'vantagens' ? loadVantagens() : loadResgates())}>
              Atualizar
            </Button>
            {!isAdmin && tab === 'vantagens' && (
              <Link className="button button--primary" to="/vantagens/nova">
                <Plus size={16} />
                <span>Nova vantagem</span>
              </Link>
            )}
          </>
        }
      />

      {!isAdmin && (
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-line)' }}>
          <button type="button" style={tabStyle(tab === 'vantagens')} onClick={() => changeTab('vantagens')}>Vantagens</button>
          <button type="button" style={tabStyle(tab === 'resgates')} onClick={() => changeTab('resgates')}>
            Resgates
            {resgates.length > 0 && tab !== 'resgates' && (
              <span style={{ marginLeft: '0.375rem', background: 'var(--color-puc-blue)', color: 'var(--color-on-primary)', borderRadius: '9999px', fontSize: '0.7rem', padding: '0 0.375rem', lineHeight: '1.5' }}>{resgates.length}</span>
            )}
          </button>
        </div>
      )}

      {error ? <Alert tone="error">{error}</Alert> : null}

      {tab === 'vantagens' ? (
        <>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <SearchInput value={queryV} onChange={setQueryV} placeholder="Buscar por titulo..." />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              style={{ padding: '0.45rem 0.75rem', border: '1px solid var(--color-line)', borderRadius: '6px', background: 'var(--color-surface)', color: 'var(--color-ink)', fontSize: '0.875rem', outline: 'none' }}
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativas</option>
              <option value="inactive">Inativas</option>
            </select>
          </div>
          <div className="table-card">
          {loading ? (
            <div className="empty-state">Carregando vantagens...</div>
          ) : filteredV.length === 0 ? (
            <div className="empty-state">
              <strong>{vantagens.length === 0 ? 'Nenhuma vantagem cadastrada' : 'Nenhum resultado para os filtros'}</strong>
              <span>{vantagens.length === 0 ? 'Use o botao Nova vantagem para comecar a oferecer beneficios.' : 'Tente outros termos.'}</span>
            </div>
          ) : (
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>Titulo</th>
                    {isAdmin && <th>Parceiro</th>}
                    <th>Custo</th>
                    <th>Status</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredV.map((v) => (
                    <tr key={v.id} style={{ cursor: isAdmin ? 'default' : 'pointer' }} onClick={isAdmin ? undefined : () => void handleRowClick(v)}>
                      <td>
                        <strong>{v.title}</strong>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-muted)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {v.description}
                        </span>
                      </td>
                      {isAdmin && <td style={{ fontSize: '0.875rem' }}>{v.partner.name}</td>}
                      <td>{v.costInCoins} moedas</td>
                      <td>
                        {v.isActive ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--color-surface-strong)', color: 'var(--color-success)', borderRadius: '9999px', padding: '0.125rem 0.625rem', fontSize: '0.75rem', fontWeight: 600 }}>Ativa</span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--color-surface-strong)', color: 'var(--color-muted)', borderRadius: '9999px', padding: '0.125rem 0.625rem', fontSize: '0.75rem', fontWeight: 600 }}>Inativa</span>
                        )}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="table-actions">
                          <button className="icon-button" type="button" title={v.isActive ? 'Desativar' : 'Ativar'} disabled={toggling === v.id} onClick={() => void handleToggle(v)}>
                            {v.isActive ? <ToggleRight size={16} style={{ color: 'var(--color-success)' }} /> : <ToggleLeft size={16} />}
                          </button>
                          <Link className="icon-button" to={`/vantagens/${v.id}/editar`} aria-label="Editar vantagem">
                            <Edit3 size={16} />
                          </Link>
                          <button className="icon-button icon-button--danger" type="button" onClick={() => setConfirmDeleteId(v.id)} aria-label="Remover vantagem">
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
        </>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <SearchInput value={queryR} onChange={setQueryR} placeholder="Buscar por aluno ou vantagem..." />
          </div>
          <div className="table-card">
          {loading ? (
            <div className="empty-state">Carregando resgates...</div>
          ) : filteredR.length === 0 ? (
            <div className="empty-state">
              <strong>{resgates.length === 0 ? 'Nenhum resgate ainda' : 'Nenhum resultado para a busca'}</strong>
              <span>{resgates.length === 0 ? 'Os resgates feitos pelos alunos apareceram aqui.' : 'Tente outros termos.'}</span>
            </div>
          ) : (
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Vantagem</th>
                    <th>Aluno</th>
                    <th>Moedas</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredR.map((r) => (
                    <tr key={r.id}>
                      <td>{new Date(r.createdAt).toLocaleString('pt-BR')}</td>
                      <td><strong>{r.advantage.title}</strong></td>
                      <td>{r.student.name}</td>
                      <td>{r.coinCost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </>
      )}

      {modal ? (
        <Modal title={`Resgates — ${modal.vantagem.title}`} onClose={() => setModal(null)}>
          {modalError ? <Alert tone="error">{modalError}</Alert> : null}
          {modalLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-muted)' }}>Carregando...</div>
          ) : modal.resgates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-muted)' }}>
              <ShoppingBag size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
              <p style={{ margin: 0 }}>Nenhum resgate para esta vantagem ainda.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {modal.resgates.map((r) => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--color-surface-strong)', borderRadius: '6px', border: '1px solid var(--color-line)', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-ink)' }}>{r.student.name}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                      {new Date(r.createdAt).toLocaleDateString('pt-BR')} · {r.coinCost} moedas
                    </p>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-success)', fontWeight: 600 }}>Resgatado</span>
                </div>
              ))}
            </div>
          )}
        </Modal>
      ) : null}
    </section>
    </>
  );
}
