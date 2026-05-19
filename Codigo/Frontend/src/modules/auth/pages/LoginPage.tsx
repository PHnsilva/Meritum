import { LogIn, School, UserPlus, KeyRound, Building2, Landmark } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { ThemeToggle } from '../../../shared/components/ThemeToggle';
import { TextField } from '../../../shared/components/TextField';
import { isValidEmail } from '../../../shared/utils/validators';
import { login } from '../services/authService';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Informe um email valido');
      return;
    }

    try {
      setLoading(true);
      await login({ email: email.trim(), password });
      navigate('/');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Nao foi possivel autenticar');
    } finally {
      setLoading(false);
    }
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
          <strong>Moedas, vantagens e merito em um painel unico.</strong>
        </div>
      </section>

      <section className="login-card">
        <div className="login-card__tools">
          <ThemeToggle />
        </div>
        <div className="login-card__header">
          <p className="eyebrow">Acesso</p>
          <h1>Entrar no sistema</h1>
          <span>Aluno, professor, parceiro ou instituicao — use seu email e senha.</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error ? <Alert tone="error">{error}</Alert> : null}
          <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <TextField label="Senha" type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required />
          <Button type="submit" icon={<LogIn size={16} />} disabled={loading}>
            {loading ? 'Autenticando...' : 'Entrar'}
          </Button>
        </form>

        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
          <Link to="/cadastro" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
            <UserPlus size={14} />
            Sou aluno e nao tenho conta — cadastrar
          </Link>
          <Link to="/ativar-conta" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
            <KeyRound size={14} />
            Sou professor — ativar minha conta
          </Link>
          <Link to="/cadastro-parceiro" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
            <Building2 size={14} />
            Quer se tornar parceiro?
          </Link>
          <Link to="/cadastro-instituicao" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
            <Landmark size={14} />
            Solicitar cadastro de instituicao
          </Link>
        </div>
      </section>
    </main>
  );
}
