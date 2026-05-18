import { ArrowDown, ArrowLeft, ArrowUp, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SearchInput } from '../../../shared/components/SearchInput';
import { SelectField } from '../../../shared/components/SelectField';
import { getStoredUser } from '../../auth/services/authService';
import { listAlunos } from '../../aluno/services/alunoService';
import type { Aluno } from '../../aluno/types/aluno';
import { listMeusResgates, listResgatesByAluno } from '../../vantagem/services/vantagemService';
import type { Resgate } from '../../vantagem/types/vantagem';
import { getExtratoAluno } from '../services/moedaService';
import type { ExtratoResponse } from '../types/moeda';

type EntryKind = 'received' | 'redeemed';
type Entry = {
  id: string;
  kind: EntryKind;
  date: string;
  amount: number;
  label: string;
  detail: string;
};

function buildEntries(extrato: ExtratoResponse, resgates: Resgate[]): Entry[] {
  const received: Entry[] = extrato.transactions.map((tx) => ({
    id: tx.id,
    kind: 'received',
    date: tx.createdAt,
    amount: tx.amount,
    label: tx.professor ? tx.professor.name : 'Professor',
    detail: tx.motive
  }));

  const redeemed: Entry[] = resgates.map((r) => ({
    id: r.id,
    kind: 'redeemed',
    date: r.createdAt,
    amount: r.coinCost,
    label: r.advantage.title,
    detail: r.advantage.partner
  }));

  return [...received, ...redeemed].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function ExtratoAlunoPage() {
  const storedUser = getStoredUser();
  const isStudent = storedUser?.role === 'student';

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [studentId, setStudentId] = useState(isStudent ? storedUser.id : '');
  const [coinBalance, setCoinBalance] = useState<number | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<'' | EntryKind>('');
  const [loadingAlunos, setLoadingAlunos] = useState(!isStudent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadExtrato(id: string) {
    if (!id) return;
    setLoading(true);
    setError('');
    setEntries([]);
    setCoinBalance(null);
    try {
      if (isStudent) {
        const [extrato, resgates] = await Promise.all([getExtratoAluno(id), listMeusResgates()]);
        setCoinBalance(extrato.coinBalance);
        setEntries(buildEntries(extrato, resgates));
      } else {
        const [extrato, resgates] = await Promise.all([getExtratoAluno(id), listResgatesByAluno(id)]);
        setCoinBalance(extrato.coinBalance);
        setEntries(buildEntries(extrato, resgates));
      }
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

  const received = entries.filter((e) => e.kind === 'received').reduce((s, e) => s + e.amount, 0);
  const redeemed = entries.filter((e) => e.kind === 'redeemed').reduce((s, e) => s + e.amount, 0);

  const q = query.toLowerCase();
  const filteredEntries = entries.filter(
    (e) =>
      (e.label.toLowerCase().includes(q) || e.detail.toLowerCase().includes(q)) &&
      (!kindFilter || e.kind === kindFilter)
  );

  return (
    <section className="stack">
      <PageHeader
        title={isStudent ? 'Meu Extrato' : 'Extrato do Aluno'}
        description="Historico completo de recebimentos e resgates de moedas."
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

      {coinBalance !== null && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 160, padding: '1rem 1.25rem', background: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: 'var(--color-muted)' }}>Saldo atual</p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-ink)' }}>{coinBalance} <span style={{ fontSize: '0.875rem', fontWeight: 400 }}>moedas</span></p>
          </div>
          <div style={{ flex: 1, minWidth: 140, padding: '1rem 1.25rem', background: 'var(--color-surface-strong)', border: '1px solid var(--color-line)', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: 'var(--color-muted)' }}>Total recebido</p>
            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-success)' }}>+{received}</p>
          </div>
          <div style={{ flex: 1, minWidth: 140, padding: '1rem 1.25rem', background: 'var(--color-surface-strong)', border: '1px solid var(--color-line)', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: 'var(--color-muted)' }}>Total gasto</p>
            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-danger)' }}>-{redeemed}</p>
          </div>
        </div>
      )}

      {entries.length > 0 && (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar por descricao ou detalhe..." />
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value as '' | EntryKind)}
            style={{ padding: '0.45rem 0.75rem', border: '1px solid var(--color-line)', borderRadius: '6px', background: 'var(--color-surface)', color: 'var(--color-ink)', fontSize: '0.875rem', outline: 'none' }}
          >
            <option value="">Todos os tipos</option>
            <option value="received">Recebimentos</option>
            <option value="redeemed">Resgates</option>
          </select>
        </div>
      )}

      {loading ? (
        <div className="empty-state">Carregando extrato...</div>
      ) : filteredEntries.length > 0 ? (
        <div className="table-card">
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Data</th>
                  <th>Descricao</th>
                  <th>Detalhe</th>
                  <th style={{ textAlign: 'right' }}>Moedas</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td style={{ width: 32 }}>
                      {entry.kind === 'received'
                        ? <ArrowDown size={15} style={{ color: 'var(--color-success)' }} />
                        : <ArrowUp size={15} style={{ color: 'var(--color-danger)' }} />
                      }
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(entry.date).toLocaleString('pt-BR')}</td>
                    <td><strong>{entry.label}</strong></td>
                    <td style={{ maxWidth: 220, wordBreak: 'break-word', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{entry.detail}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {entry.kind === 'received'
                        ? <span style={{ color: 'var(--color-success)' }}>+{entry.amount}</span>
                        : <span style={{ color: 'var(--color-danger)' }}>-{entry.amount}</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : entries.length > 0 ? (
        <div className="empty-state">
          <strong>Nenhum resultado para os filtros</strong>
          <span>Tente outros termos ou limpe os filtros.</span>
        </div>
      ) : coinBalance !== null ? (
        <div className="empty-state">
          <strong>Nenhum movimento registrado</strong>
          <span>Os recebimentos e resgates apareceram aqui.</span>
        </div>
      ) : null}
    </section>
  );
}
