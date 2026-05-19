import { ArrowLeft, Gift, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SearchInput } from '../../../shared/components/SearchInput';
import { listPartnerResgatesByAdmin } from '../../vantagem/services/vantagemService';
import type { Resgate } from '../../vantagem/types/vantagem';

export function ParceiroResgatesPage() {
  const { id } = useParams<{ id: string }>();
  const [resgates, setResgates] = useState<Resgate[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      setResgates(await listPartnerResgatesByAdmin(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel carregar os resgates');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [id]);

  const q = query.toLowerCase();
  const filtered = resgates.filter(
    (r) =>
      r.student.name.toLowerCase().includes(q) ||
      r.advantage.title.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q)
  );

  return (
    <section className="stack">
      <PageHeader
        title="Resgates do parceiro"
        description="Historico de resgates das vantagens desta empresa parceira."
        actions={
          <>
            <Link className="button button--secondary" to="/parceiros">
              <ArrowLeft size={16} />
              <span>Voltar</span>
            </Link>
            <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={() => void load()}>
              Atualizar
            </Button>
          </>
        }
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.25rem' }}>
        <SearchInput value={query} onChange={setQuery} placeholder="Buscar por aluno, vantagem ou codigo..." />
      </div>

      <div className="table-card">
        {loading ? (
          <div className="empty-state">Carregando resgates...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <strong>{resgates.length === 0 ? 'Nenhum resgate registrado' : 'Nenhum resultado'}</strong>
            <span>{resgates.length === 0 ? 'Quando alunos resgatarem vantagens desta empresa, aparecera aqui.' : 'Tente outros termos.'}</span>
          </div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Vantagem</th>
                  <th>Moedas</th>
                  <th>Codigo</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.student.name}</strong>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Gift size={13} style={{ color: 'var(--color-puc-blue)' }} />
                        {r.advantage.title}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#dc2626' }}>{r.coinCost}</span>
                    </td>
                    <td>
                      <code style={{ background: 'var(--color-surface-strong)', padding: '0.125rem 0.5rem', borderRadius: 4, fontSize: '0.85rem', letterSpacing: '0.1em' }}>
                        {r.code}
                      </code>
                    </td>
                    <td>{new Date(r.createdAt).toLocaleDateString('pt-BR')}</td>
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
