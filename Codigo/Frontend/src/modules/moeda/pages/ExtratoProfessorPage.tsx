import { ArrowLeft, Coins, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SearchInput } from '../../../shared/components/SearchInput';
import { SelectField } from '../../../shared/components/SelectField';
import { getStoredUser } from '../../auth/services/authService';
import { listProfessores } from '../../professor/services/professorService';
import type { Professor } from '../../professor/types/professor';
import { getExtratoProfessor } from '../services/moedaService';
import type { ExtratoResponse } from '../types/moeda';

export function ExtratoProfessorPage() {
  const storedUser = getStoredUser();
  const isProfessor = storedUser?.role === 'professor';

  const [professores, setProfessores] = useState<Professor[]>([]);
  const [professorId, setProfessorId] = useState(isProfessor ? storedUser.id : '');
  const [extrato, setExtrato] = useState<ExtratoResponse | null>(null);
  const [query, setQuery] = useState('');
  const [loadingProfs, setLoadingProfs] = useState(!isProfessor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadExtrato(id: string) {
    if (!id) return;
    setLoading(true);
    setError('');
    setExtrato(null);
    try {
      setExtrato(await getExtratoProfessor(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel carregar o extrato');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isProfessor) {
      void loadExtrato(storedUser.id);
      return;
    }
    async function loadProfs() {
      try {
        setProfessores(await listProfessores());
      } catch {
        setError('Nao foi possivel carregar professores');
      } finally {
        setLoadingProfs(false);
      }
    }
    void loadProfs();
  }, []);

  function handleProfessorChange(id: string) {
    setProfessorId(id);
    void loadExtrato(id);
  }

  return (
    <section className="stack">
      <PageHeader
        title={isProfessor ? 'Meu Extrato' : 'Extrato do Professor'}
        description="UC06 — Historico de envios de moedas e saldo atual."
        actions={
          <>
            <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={() => void loadExtrato(professorId)} disabled={!professorId}>
              Atualizar
            </Button>
            {!isProfessor && (
              <Link className="button button--secondary" to="/">
                <ArrowLeft size={16} />
                <span>Voltar</span>
              </Link>
            )}
          </>
        }
      />

      {!isProfessor && (
        <section className="work-panel">
          <SelectField
            label="Selecione o professor"
            value={professorId}
            onChange={(e) => handleProfessorChange(e.target.value)}
            placeholder={loadingProfs ? 'Carregando...' : 'Selecione o professor'}
            options={professores.map((p) => ({ value: p.id, label: `${p.name} — ${p.institution.name}` }))}
            disabled={loadingProfs}
          />
        </section>
      )}

      {error ? <Alert tone="error">{error}</Alert> : null}

      {extrato ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '1rem 1.25rem', background: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 8 }}>
            <Coins size={20} style={{ color: 'var(--color-puc-blue)' }} />
            <span style={{ fontSize: '1.1rem', color: 'var(--color-ink)' }}>Saldo atual: <strong>{extrato.coinBalance} moedas</strong></span>
          </div>

          {extrato.transactions.length > 0 && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <SearchInput value={query} onChange={setQuery} placeholder="Buscar por aluno ou motivo..." />
            </div>
          )}

          <div className="table-card">
            {(() => {
              const q = query.toLowerCase();
              const filtered = extrato.transactions.filter(
                (tx) =>
                  (tx.student?.name ?? '').toLowerCase().includes(q) ||
                  tx.motive.toLowerCase().includes(q)
              );
              return filtered.length === 0 ? (
              <div className="empty-state">
                <strong>{extrato.transactions.length === 0 ? 'Nenhum envio registrado' : 'Nenhum resultado para a busca'}</strong>
                <span>{extrato.transactions.length === 0 ? 'Voce ainda nao enviou moedas.' : 'Tente outros termos.'}</span>
              </div>
            ) : (
              <div className="responsive-table">
                <table>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Aluno</th>
                      <th>Curso</th>
                      <th>Moedas</th>
                      <th>Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((tx) => (
                      <tr key={tx.id}>
                        <td>{new Date(tx.createdAt).toLocaleString('pt-BR')}</td>
                        <td>
                          <strong>{tx.student?.name}</strong>
                          <span>{tx.student?.email}</span>
                        </td>
                        <td>{tx.student?.course}</td>
                        <td>
                          <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>
                            -{tx.amount}
                          </span>
                        </td>
                        <td style={{ maxWidth: 240, wordBreak: 'break-word' }}>{tx.motive}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
            })()}
          </div>
        </>
      ) : null}

      {loading ? <div className="empty-state">Carregando extrato...</div> : null}
    </section>
  );
}
