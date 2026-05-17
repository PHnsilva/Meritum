import { ArrowLeft, Coins, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SelectField } from '../../../shared/components/SelectField';
import { getStoredUser } from '../../auth/services/authService';
import { listAlunos } from '../../aluno/services/alunoService';
import type { Aluno } from '../../aluno/types/aluno';
import { getExtratoAluno } from '../services/moedaService';
import type { ExtratoResponse } from '../types/moeda';

export function ExtratoAlunoPage() {
  const storedUser = getStoredUser();
  const isStudent = storedUser?.role === 'student';

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [studentId, setStudentId] = useState(isStudent ? storedUser.id : '');
  const [extrato, setExtrato] = useState<ExtratoResponse | null>(null);
  const [loadingAlunos, setLoadingAlunos] = useState(!isStudent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadExtrato(id: string) {
    if (!id) return;
    setLoading(true);
    setError('');
    setExtrato(null);
    try {
      setExtrato(await getExtratoAluno(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel carregar o extrato');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isStudent) {
      void loadExtrato(storedUser.id);
      return;
    }

    async function loadAlunos() {
      try {
        setAlunos(await listAlunos());
      } catch {
        setError('Nao foi possivel carregar alunos');
      } finally {
        setLoadingAlunos(false);
      }
    }
    void loadAlunos();
  }, []);

  function handleAlunoChange(id: string) {
    setStudentId(id);
    void loadExtrato(id);
  }

  return (
    <section className="stack">
      <PageHeader
        title={isStudent ? 'Meu Extrato' : 'Extrato do Aluno'}
        description="UC06 — Historico de recebimentos de moedas e saldo atual."
        actions={
          <>
            <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={() => void loadExtrato(studentId)} disabled={!studentId}>
              Atualizar
            </Button>
            {!isStudent && (
              <Link className="button button--secondary" to="/">
                <ArrowLeft size={16} />
                <span>Voltar</span>
              </Link>
            )}
          </>
        }
      />

      {!isStudent && (
        <section className="work-panel">
          <SelectField
            label="Selecione o aluno"
            value={studentId}
            onChange={(e) => handleAlunoChange(e.target.value)}
            placeholder={loadingAlunos ? 'Carregando...' : 'Selecione o aluno'}
            options={alunos.map((a) => ({ value: a.id, label: `${a.name} — ${a.course}` }))}
            disabled={loadingAlunos}
          />
        </section>
      )}

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
                <strong>Nenhum recebimento registrado</strong>
                <span>Voce ainda nao recebeu moedas.</span>
              </div>
            ) : (
              <div className="responsive-table">
                <table>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Professor</th>
                      <th>Departamento</th>
                      <th>Moedas</th>
                      <th>Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extrato.transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td>{new Date(tx.createdAt).toLocaleString('pt-BR')}</td>
                        <td>
                          <strong>{tx.professor?.name}</strong>
                          <span>{tx.professor?.email}</span>
                        </td>
                        <td>{tx.professor?.department}</td>
                        <td>
                          <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                            +{tx.amount}
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
