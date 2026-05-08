import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { PageHeader } from '../../../shared/components/PageHeader';
import { formatCpf } from '../../../shared/utils/formatters';
import { AlunoForm } from '../components/AlunoForm';
import { getAluno, updateAluno } from '../services/alunoService';
import type { Aluno, CreateAlunoInput, UpdateAlunoInput } from '../types/aluno';

export function AlunoEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAluno() {
      if (!id) {
        return;
      }

      try {
        setAluno(await getAluno(id));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar o aluno');
      }
    }

    void loadAluno();
  }, [id]);

  async function handleSubmit(input: CreateAlunoInput | UpdateAlunoInput) {
    if (!id) {
      return;
    }

    await updateAluno(id, input);
    navigate('/alunos');
  }

  return (
    <section className="stack">
      <PageHeader
        title="Editar aluno"
        description="Atualize os dados cadastrais, instituicao, curso e senha opcional do aluno."
        actions={
          <Link className="button button--secondary" to="/alunos">
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </Link>
        }
      />
      <section className="work-panel">
        {error ? <Alert tone="error">{error}</Alert> : null}
        {!error && !aluno ? <div className="empty-state">Carregando aluno...</div> : null}
        {aluno ? (
          <AlunoForm
            initialValue={{
              name: aluno.name,
              email: aluno.email,
              cpf: formatCpf(aluno.cpf),
              rg: aluno.rg,
              address: aluno.address,
              course: aluno.course,
              institutionId: aluno.institution.id
            }}
            submitLabel="Atualizar aluno"
            requirePassword={false}
            onSubmit={handleSubmit}
          />
        ) : null}
      </section>
    </section>
  );
}
