import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../shared/components/PageHeader';
import { AlunoForm } from '../components/AlunoForm';
import { createAluno } from '../services/alunoService';
import type { CreateAlunoInput, UpdateAlunoInput } from '../types/aluno';

export function AlunoCreatePage() {
  const navigate = useNavigate();

  async function handleSubmit(input: CreateAlunoInput | UpdateAlunoInput) {
    await createAluno(input as CreateAlunoInput);
    navigate('/alunos');
  }

  return (
    <section className="stack">
      <PageHeader
        title="Novo aluno"
        description="Cadastre o aluno com dados pessoais, curso, instituicao e senha de acesso."
        actions={
          <Link className="button button--secondary" to="/alunos">
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </Link>
        }
      />
      <section className="work-panel">
        <AlunoForm onSubmit={handleSubmit} />
      </section>
    </section>
  );
}
