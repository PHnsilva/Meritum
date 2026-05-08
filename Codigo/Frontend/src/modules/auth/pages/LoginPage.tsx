import { LogIn, UserPlus, School } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { ThemeToggle } from '../../../shared/components/ThemeToggle';
import { TextField } from '../../../shared/components/TextField';
import { isValidEmail } from '../../../shared/utils/validators';
import { login, registerUser } from '../services/authService';

export function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
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
      if (mode === 'register') {
        await registerUser({ name, email: email.trim(), password });
      } else {
        await login({ email: email.trim(), password });
      }

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
          <h1>{mode === 'login' ? 'Entrar no sistema' : 'Criar usuario'}</h1>
          <span>{mode === 'login' ? 'Use seu email e senha cadastrados.' : 'Crie um acesso inicial para administrar o prototipo.'}</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error ? <Alert tone="error">{error}</Alert> : null}
          {mode === 'register' ? <TextField label="Nome" value={name} onChange={(event) => setName(event.target.value)} required /> : null}
          <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <TextField label="Senha" type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required />

          <Button type="submit" icon={mode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />} disabled={loading}>
            {loading ? 'Processando...' : mode === 'login' ? 'Entrar' : 'Criar usuario'}
          </Button>
        </form>

        <button className="link-button" type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Criar usuario administrativo' : 'Voltar para login'}
        </button>
      </section>
    </main>
  );
}
