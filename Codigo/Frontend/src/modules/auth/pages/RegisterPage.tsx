import { ArrowLeft, School, UserPlus } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { ThemeToggle } from '../../../shared/components/ThemeToggle';
import { AlunoForm } from '../../aluno/components/AlunoForm';
import { apiClient } from '../../../shared/http/apiClient';
import type { CreateAlunoInput, UpdateAlunoInput } from '../../aluno/types/aluno';

export function RegisterPage() {
  const navigate = useNavigate();

  async function handleSubmit(input: CreateAlunoInput | UpdateAlunoInput) {
    await apiClient('/api/auth/register', { method: 'POST', body: input });
    navigate('/login', { state: { registered: true } });
  }

  return (
    <main className="login-page">
      <section className="login-hero" aria-label="Meritum">
        <div className="login-hero__brand">
          <School size={42} />
          <div>
            <strong>Meritum</strong>
            <span>Sistema de reconhecimento academico</span>
          </div>
        </div>
        <div className="login-hero__panel">
          <span>PUC Minas</span>
          <strong>Cadastre-se e comece a acumular moedas pelo seu merito.</strong>
        </div>
      </section>

      <section className="login-card" style={{ overflowY: 'auto', maxHeight: '100dvh' }}>
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
      </section>
    </main>
  );
}
