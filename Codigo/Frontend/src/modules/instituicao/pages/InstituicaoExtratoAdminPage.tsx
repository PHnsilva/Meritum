import { ArrowLeft, Coins, Gift, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SearchInput } from '../../../shared/components/SearchInput';
import { getInstituicao } from '../services/instituicaoService';
import { getInstituicaoTransacoesByAdmin, type InstitutionRedemption, type InstitutionTransaction } from '../services/transacoesService';

export function InstituicaoExtratoAdminPage() {
  const { id } = useParams<{ id: string }>();
  const [institutionName, setInstitutionName] = useState('');
  const [transactions, setTransactions] = useState<InstitutionTransaction[]>([]);
  const [redemptions, setRedemptions] = useState<InstitutionRedemption[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'transactions' | 'redemptions'>('transactions');

  async function load() {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const [data, inst] = await Promise.all([
        getInstituicaoTransacoesByAdmin(id),
        getInstituicao(id)
      ]);
      setTransactions(data.transactions);
      setRedemptions(data.redemptions);
      setInstitutionName(inst.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel carregar o extrato');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [id]);

  const q = query.toLowerCase();

  const filteredTx = transactions.filter(
    (t) =>
      t.student.name.toLowerCase().includes(q) ||
      t.professor.name.toLowerCase().includes(q) ||
      t.motive.toLowerCase().includes(q)
  );

  const filteredRed = redemptions.filter(
    (r) =>
      r.student.name.toLowerCase().includes(q) ||
      r.advantage.title.toLowerCase().includes(q) ||
      r.advantage.partner.name.toLowerCase().includes(q)
  );

  const tabStyle = (active: boolean): React.CSSProperties => ({
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid var(--color-puc-blue)' : '2px solid transparent',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    fontWeight: active ? 600 : 400,
    color: active ? 'var(--color-puc-blue)' : 'var(--color-muted)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.875rem'
  });

  return (
    <section className="stack">
      <PageHeader
        title={`Extrato — ${institutionName || 'Instituicao'}`}
        description="Historico de envios de moedas e resgates dos alunos desta instituicao."
        actions={
          <>
            <Link className="button button--secondary" to="/instituicoes">
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
        <SearchInput value={query} onChange={setQuery} placeholder="Buscar por aluno, professor ou vantagem..." />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-line)', marginBottom: '-1px' }}>
        <button type="button" style={tabStyle(tab === 'transactions')} onClick={() => setTab('transactions')}>
          <Coins size={13} />
          Envios de moedas
          <span style={{ background: 'var(--color-surface-strong)', borderRadius: '9999px', fontSize: '0.7rem', padding: '0 0.375rem', lineHeight: '1.4' }}>
            {transactions.length}
          </span>
        </button>
        <button type="button" style={tabStyle(tab === 'redemptions')} onClick={() => setTab('redemptions')}>
          <Gift size={13} />
          Resgates
          <span style={{ background: 'var(--color-surface-strong)', borderRadius: '9999px', fontSize: '0.7rem', padding: '0 0.375rem', lineHeight: '1.4' }}>
            {redemptions.length}
          </span>
        </button>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="empty-state">Carregando extrato...</div>
        ) : tab === 'transactions' ? (
          filteredTx.length === 0 ? (
            <div className="empty-state">
              <strong>{transactions.length === 0 ? 'Nenhum envio de moedas registrado' : 'Nenhum resultado'}</strong>
            </div>
          ) : (
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Curso</th>
                    <th>Professor</th>
                    <th>Moedas</th>
                    <th>Motivo</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTx.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <strong>{t.student.name}</strong>
                        <span>{t.student.email}</span>
                      </td>
                      <td>{t.student.course}</td>
                      <td>
                        <strong>{t.professor.name}</strong>
                        <span>{t.professor.department}</span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600, color: 'var(--color-puc-blue)' }}>
                          <Coins size={14} />
                          {t.amount}
                        </span>
                      </td>
                      <td>{t.motive}</td>
                      <td>{new Date(t.createdAt).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          filteredRed.length === 0 ? (
            <div className="empty-state">
              <strong>{redemptions.length === 0 ? 'Nenhum resgate registrado' : 'Nenhum resultado'}</strong>
            </div>
          ) : (
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Vantagem</th>
                    <th>Parceiro</th>
                    <th>Moedas</th>
                    <th>Codigo</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRed.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <strong>{r.student.name}</strong>
                        <span>{r.student.email}</span>
                      </td>
                      <td>{r.advantage.title}</td>
                      <td>{r.advantage.partner.name}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600, color: '#dc2626' }}>
                          <Coins size={14} />
                          {r.coinCost}
                        </span>
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
          )
        )}
      </div>
    </section>
  );
}
