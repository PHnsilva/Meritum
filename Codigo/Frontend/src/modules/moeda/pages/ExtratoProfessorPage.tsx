import { ArrowLeft, Coins, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SelectField } from '../../../shared/components/SelectField';
import { listProfessores } from '../../professor/services/professorService';
import type { Professor } from '../../professor/types/professor';
import { getExtratoProfessor } from '../services/moedaService';
import type { ExtratoResponse } from '../types/moeda';

export function ExtratoProfessorPage() {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [professorId, setProfessorId] = useState('');
  const [extrato, setExtrato] = useState<ExtratoResponse | null>(null);
  const [loadingProfs, setLoadingProfs] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setProfessores(await listProfessores());
      } catch {
        setError('Nao foi possivel carregar professores');
      } finally {
        setLoadingProfs(false);
      }
    }
    void load();
  }, []);

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

  function handleProfessorChange(id: string) {
    setProfessorId(id);
    void loadExtrato(id);
  }

  return (
    <section className="stack">
      <PageHeader
        title="Extrato do Professor"
        description="UC06 — Historico de envios de moedas e saldo atual."
        actions={
          <>
            <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={() => void loadExtrato(professorId)} disabled={!professorId}>
              Atualizar
            </Button>
            <Link className="button button--secondary" to="/">
              <ArrowLeft size={16} />
              <span>Voltar</span>
            </Link>
          </>
        }
      />

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

      {error ? <Alert tone="error">{error}</Alert> : null}

      {extrato ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px', background: 'var(--surface-2)', borderRadius: 8 }}>
            <Coins size={20} />
            <span style={{ fontSize: '1.1rem' }}>Saldo atual: <strong>{extrato.coinBalance} moedas</strong></span>
          </div>

          <div className="table-card">
            {extrato.transactions.length === 0 ? (
              <div className="empty-state">
                <strong>Nenhum envio registrado</strong>
                <span>Este professor ainda nao enviou moedas.</span>
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
                    {extrato.transactions.map((tx) => (
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
            )}
          </div>
        </>
      ) : null}

      {loading ? <div className="empty-state">Carregando extrato...</div> : null}
    </section>
  );
}
