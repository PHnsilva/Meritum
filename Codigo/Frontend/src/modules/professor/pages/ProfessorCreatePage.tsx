import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../shared/components/PageHeader';
import { ProfessorForm } from '../components/ProfessorForm';
import { createProfessor } from '../services/professorService';
import type { CreateProfessorInput, UpdateProfessorInput } from '../types/professor';

export function ProfessorCreatePage() {
  const navigate = useNavigate();

  async function handleSubmit(input: CreateProfessorInput | UpdateProfessorInput) {
    await createProfessor(input as CreateProfessorInput);
    navigate('/professores');
  }

  return (
    <section className="stack">
      <PageHeader
        title="Novo professor"
        description="Cadastre um professor vinculado a uma instituicao. Ele recebera 1.000 moedas iniciais."
        actions={
          <Link className="button button--secondary" to="/professores">
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </Link>
        }
      />
      <section className="work-panel">
        <ProfessorForm onSubmit={handleSubmit} />
      </section>
    </section>
  );
}
