import { ArrowLeft, Mail, School } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { TextField } from '../../../shared/components/TextField';
import { ThemeToggle } from '../../../shared/components/ThemeToggle';
import { isValidEmail } from '../../../shared/utils/validators';
import { requestActivation } from '../services/authService';
import { AuthPageWrapper } from '../components/AuthPageWrapper';

export function ActivarContaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Informe um email valido');
      return;
    }

    try {
      setLoading(true);
      await requestActivation(email.trim());
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel processar a solicitacao');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageWrapper>
      <div className="login-card__tools">
        <ThemeToggle />
      </div>
      <div className="login-card__header">
        <p className="eyebrow">Professor</p>
        <h1>Ativar conta</h1>
        <span>Informe o email cadastrado pela instituicao. Voce recebera uma senha temporaria.</span>
      </div>

      {success ? (
        <Alert tone="success">
          Solicitacao enviada! Se o email estiver cadastrado, voce recebera a senha temporaria em instantes.
          Verifique sua caixa de entrada e acesse o login.
        </Alert>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          {error ? <Alert tone="error">{error}</Alert> : null}
          <TextField
            label="Email institucional"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" icon={<Mail size={16} />} disabled={loading}>
            {loading ? 'Enviando...' : 'Receber senha temporaria'}
          </Button>
        </form>
      )}

      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={14} />
          Voltar para o login
        </Link>
      </div>
    </AuthPageWrapper>
  );
}
