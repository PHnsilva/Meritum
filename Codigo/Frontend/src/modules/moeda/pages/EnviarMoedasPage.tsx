import { ArrowLeft, Coins, Send } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SelectField } from '../../../shared/components/SelectField';
import { TextField } from '../../../shared/components/TextField';
import { listAlunos } from '../../aluno/services/alunoService';
import type { Aluno } from '../../aluno/types/aluno';
import { listProfessores } from '../../professor/services/professorService';
import type { Professor } from '../../professor/types/professor';
import { enviarMoedas } from '../services/moedaService';

export function EnviarMoedasPage() {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [professorId, setProfessorId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [amount, setAmount] = useState('');
  const [motive, setMotive] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [profs, studs] = await Promise.all([listProfessores(), listAlunos()]);
        setProfessores(profs);
        setAlunos(studs);
      } catch {
        setError('Nao foi possivel carregar professores e alunos');
      } finally {
        setLoadingData(false);
      }
    }
    void load();
  }, []);

  const selectedProfessor = professores.find((p) => p.id === professorId);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const amountNum = Number(amount);

    if (!professorId) {
      setError('Selecione o professor remetente');
      return;
    }
    if (!studentId) {
      setError('Selecione o aluno destinatario');
      return;
    }
    if (!amountNum || amountNum < 1) {
      setError('Informe uma quantidade valida de moedas');
      return;
    }
    if (!motive.trim()) {
      setError('O motivo do reconhecimento e obrigatorio');
      return;
    }

    try {
      setLoading(true);
      await enviarMoedas({ professorId, studentId, amount: amountNum, motive: motive.trim() });
      setSuccess(`${amountNum} moedas enviadas com sucesso! O aluno sera notificado por email.`);
      setStudentId('');
      setAmount('');
      setMotive('');
      const [profs] = await Promise.all([listProfessores()]);
      setProfessores(profs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel enviar as moedas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="stack">
      <PageHeader
        title="Enviar Moedas"
        description="UC05 — Professor envia moedas para reconhecer o merito de um aluno."
        actions={
          <Link className="button button--secondary" to="/">
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </Link>
        }
      />

      <section className="work-panel">
        {error ? <Alert tone="error">{error}</Alert> : null}
        {success ? <Alert tone="success">{success}</Alert> : null}

        {selectedProfessor ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 8 }}>
            <Coins size={18} />
            <span>Saldo do professor: <strong>{selectedProfessor.coinBalance} moedas</strong></span>
          </div>
        ) : null}

        <form className="form-grid" onSubmit={handleSubmit}>
          <SelectField
            label="Professor remetente"
            value={professorId}
            onChange={(e) => setProfessorId(e.target.value)}
            placeholder={loadingData ? 'Carregando...' : 'Selecione o professor'}
            options={professores.map((p) => ({ value: p.id, label: `${p.name} — ${p.institution.name}` }))}
            disabled={loadingData}
            required
          />
          <SelectField
            label="Aluno destinatario"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder={loadingData ? 'Carregando...' : 'Selecione o aluno'}
            options={alunos.map((a) => ({ value: a.id, label: `${a.name} — ${a.course}` }))}
            disabled={loadingData}
            required
          />
          <TextField
            label="Quantidade de moedas"
            type="number"
            inputMode="numeric"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <TextField
            label="Motivo do reconhecimento"
            value={motive}
            onChange={(e) => setMotive(e.target.value)}
            hint="Campo obrigatorio — descreva o motivo pelo qual o aluno esta sendo reconhecido"
            required
          />
          <div className="form-grid__actions">
            <Button type="submit" icon={<Send size={16} />} disabled={loading || loadingData}>
              {loading ? 'Enviando...' : 'Enviar moedas'}
            </Button>
          </div>
        </form>
      </section>
    </section>
  );
}
