import { CheckCircle, Clock, Edit3, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { PageHeader } from '../../../shared/components/PageHeader';
import { formatCnpj } from '../../../shared/utils/formatters';
import { approveParceiro, deleteParceiro, listParceiros } from '../services/parceiroService';
import type { Parceiro } from '../types/parceiro';

type Tab = 'all' | 'pending' | 'approved';

export function ParceiroListPage() {
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [approving, setApproving] = useState<string | null>(null);

  async function loadParceiros(currentTab: Tab = tab) {
    setLoading(true);
    setError('');
    try {
      const status = currentTab === 'pending' ? 'PENDING' : currentTab === 'approved' ? 'APPROVED' : undefined;
      setParceiros(await listParceiros(status));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar parceiros');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: string) {
    setApproving(id);
    setError('');
    try {
      await approveParceiro(id);
      await loadParceiros();
    } catch (approveError) {
      setError(approveError instanceof Error ? approveError.message : 'Nao foi possivel aprovar a empresa parceira');
    } finally {
      setApproving(null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Deseja remover esta empresa parceira?')) return;
    try {
      await deleteParceiro(id);
      await loadParceiros();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Nao foi possivel remover a empresa parceira');
    }
  }

  function changeTab(next: Tab) {
    setTab(next);
    void loadParceiros(next);
  }

  useEffect(() => {
    void loadParceiros();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pendingCount = parceiros.filter((p) => p.status === 'pending').length;

  return (
    <section className="stack">
      <PageHeader
        title="Empresas parceiras"
        description="Gerencie empresas que poderao oferecer vantagens para troca de moedas."
        actions={
          <>
            <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={() => void loadParceiros()}>
              Atualizar
            </Button>
            <Link className="button button--primary" to="/parceiros/novo">
              <Plus size={16} />
              <span>Novo parceiro</span>
            </Link>
          </>
        }
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-border, #e2e8f0)', marginBottom: '-1px' }}>
        {(['all', 'pending', 'approved'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => changeTab(t)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: tab === t ? '2px solid var(--color-primary, #2563eb)' : '2px solid transparent',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontWeight: tab === t ? 600 : 400,
              color: tab === t ? 'var(--color-primary, #2563eb)' : 'inherit',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.875rem'
            }}
          >
            {t === 'all' && 'Todos'}
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
                Aprovados
              </>
            )}
          </button>
        ))}
      </div>

      <div className="table-card">
        {loading ? (
          <div className="empty-state">Carregando parceiros...</div>
        ) : parceiros.length === 0 ? (
          <div className="empty-state">
            <strong>
              {tab === 'pending' ? 'Nenhuma solicitacao pendente' : 'Nenhuma empresa parceira cadastrada'}
            </strong>
            <span>
              {tab === 'pending'
                ? 'Quando empresas se cadastrarem pelo link publico, aparecera aqui.'
                : 'Use o botao novo parceiro para iniciar o cadastro.'}
            </span>
          </div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>CNPJ</th>
                  <th>Email</th>
                  <th>Endereco</th>
                  <th>Status</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {parceiros.map((parceiro) => (
                  <tr key={parceiro.id}>
                    <td>
                      <strong>{parceiro.tradeName || parceiro.corporateName}</strong>
                      <span>{parceiro.corporateName}</span>
                    </td>
                    <td>{formatCnpj(parceiro.cnpj)}</td>
                    <td>{parceiro.email}</td>
                    <td>{parceiro.address}</td>
                    <td>
                      {parceiro.status === 'pending' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#fef9c3', color: '#854d0e', borderRadius: '9999px', padding: '0.125rem 0.625rem', fontSize: '0.75rem', fontWeight: 600 }}>
                          <Clock size={11} />
                          Pendente
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#dcfce7', color: '#166534', borderRadius: '9999px', padding: '0.125rem 0.625rem', fontSize: '0.75rem', fontWeight: 600 }}>
                          <CheckCircle size={11} />
                          Aprovado
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        {parceiro.status === 'pending' && (
                          <Button
                            variant="primary"
                            icon={<CheckCircle size={14} />}
                            disabled={approving === parceiro.id}
                            onClick={() => void handleApprove(parceiro.id)}
                            style={{ padding: '0.25rem 0.625rem', fontSize: '0.8rem' }}
                          >
                            {approving === parceiro.id ? 'Aprovando...' : 'Aprovar'}
                          </Button>
                        )}
                        <Link className="icon-button" to={`/parceiros/${parceiro.id}/editar`} aria-label="Editar parceiro">
                          <Edit3 size={16} />
                        </Link>
                        <button className="icon-button icon-button--danger" type="button" onClick={() => void handleDelete(parceiro.id)} aria-label="Remover parceiro">
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
