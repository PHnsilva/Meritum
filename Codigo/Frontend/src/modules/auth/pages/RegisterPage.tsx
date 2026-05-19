import { ArrowLeft, School, UserPlus } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { ThemeToggle } from '../../../shared/components/ThemeToggle';
import { AlunoForm } from '../../aluno/components/AlunoForm';
import { apiClient } from '../../../shared/http/apiClient';
import { AuthPageWrapper } from '../components/AuthPageWrapper';
import type { CreateAlunoInput, UpdateAlunoInput } from '../../aluno/types/aluno';

export function RegisterPage() {
  const navigate = useNavigate();

  async function handleSubmit(input: CreateAlunoInput | UpdateAlunoInput) {
    await apiClient('/api/auth/register', { method: 'POST', body: input });
    navigate('/login', { state: { registered: true } });
  }

  return (
    <AuthPageWrapper>
      <div className="login-card__tools">
        <ThemeToggle />
      </div>
      <div className="login-card__header">
        <p className="eyebrow">Novo aluno</p>
        <h1>Criar conta</h1>
        <span>Preencha seus dados para ingressar no sistema de merito estudantil.</span>
      </div>

      <AlunoForm
        submitLabel="Criar conta"
        onSubmit={handleSubmit}
      />

      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={14} />
          Ja tenho conta — entrar
        </Link>
      </div>
    </AuthPageWrapper>
  );
}
