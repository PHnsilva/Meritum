import { Edit3, Plus, RefreshCw, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { PageHeader } from '../../../shared/components/PageHeader';
import { deleteVantagem, listMinhasVantagens, updateVantagem } from '../services/vantagemService';
import type { Vantagem } from '../types/vantagem';

export function VantagemManagePage() {
  const [vantagens, setVantagens] = useState<Vantagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setVantagens(await listMinhasVantagens());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel carregar as vantagens');
    } finally {
      setLoading(false);
    }
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

  async function handleDelete(id: string) {
    if (!window.confirm('Deseja remover esta vantagem?')) return;
    setError('');
    try {
      await deleteVantagem(id);
      setVantagens((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel remover a vantagem');
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <section className="stack">
      <PageHeader
        title="Minhas vantagens"
        description="Gerencie as vantagens que voce oferece para troca de moedas."
        actions={
          <>
            <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={() => void load()}>
              Atualizar
            </Button>
            <Link className="button button--primary" to="/vantagens/nova">
              <Plus size={16} />
              <span>Nova vantagem</span>
            </Link>
          </>
        }
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="table-card">
        {loading ? (
          <div className="empty-state">Carregando vantagens...</div>
        ) : vantagens.length === 0 ? (
          <div className="empty-state">
            <strong>Nenhuma vantagem cadastrada</strong>
            <span>Use o botao Nova vantagem para comecar a oferecer beneficios.</span>
          </div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Titulo</th>
                  <th>Custo</th>
                  <th>Status</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {vantagens.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <strong>{v.title}</strong>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted, #64748b)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {v.description}
                      </span>
                    </td>
                    <td>{v.costInCoins} moedas</td>
                    <td>
                      {v.isActive ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#dcfce7', color: '#166534', borderRadius: '9999px', padding: '0.125rem 0.625rem', fontSize: '0.75rem', fontWeight: 600 }}>
                          Ativa
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#f1f5f9', color: '#64748b', borderRadius: '9999px', padding: '0.125rem 0.625rem', fontSize: '0.75rem', fontWeight: 600 }}>
                          Inativa
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="icon-button"
                          type="button"
                          title={v.isActive ? 'Desativar' : 'Ativar'}
                          disabled={toggling === v.id}
                          onClick={() => void handleToggle(v)}
                        >
                          {v.isActive ? <ToggleRight size={16} style={{ color: '#16a34a' }} /> : <ToggleLeft size={16} />}
                        </button>
                        <Link className="icon-button" to={`/vantagens/${v.id}/editar`} aria-label="Editar vantagem">
                          <Edit3 size={16} />
                        </Link>
                        <button className="icon-button icon-button--danger" type="button" onClick={() => void handleDelete(v.id)} aria-label="Remover vantagem">
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
