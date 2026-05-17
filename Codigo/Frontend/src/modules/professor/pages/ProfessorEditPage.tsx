import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { PageHeader } from '../../../shared/components/PageHeader';
import { formatCpf } from '../../../shared/utils/formatters';
import { ProfessorForm } from '../components/ProfessorForm';
import { getProfessor, updateProfessor } from '../services/professorService';
import type { CreateProfessorInput, Professor, UpdateProfessorInput } from '../types/professor';

export function ProfessorEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        setProfessor(await getProfessor(id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Nao foi possivel carregar o professor');
      }
    }
    void load();
  }, [id]);

  async function handleSubmit(input: CreateProfessorInput | UpdateProfessorInput) {
    if (!id) return;
    await updateProfessor(id, input);
    navigate('/professores');
  }

  return (
    <section className="stack">
      <PageHeader
        title="Editar professor"
        description="Atualize os dados cadastrais do professor."
        actions={
          <Link className="button button--secondary" to="/professores">
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </Link>
        }
      />
      <section className="work-panel">
        {error ? <Alert tone="error">{error}</Alert> : null}
        {!error && !professor ? <div className="empty-state">Carregando professor...</div> : null}
        {professor ? (
          <ProfessorForm
            initialValue={{
              name: professor.name,
              email: professor.email,
              cpf: formatCpf(professor.cpf),
              department: professor.department,
              institutionId: professor.institution.id
            }}
            submitLabel="Atualizar professor"
            requirePassword={false}
            onSubmit={handleSubmit}
          />
        ) : null}
      </section>
    </section>
  );
}
