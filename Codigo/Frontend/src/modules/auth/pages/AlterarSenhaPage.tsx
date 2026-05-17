import { KeyRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { PageHeader } from '../../../shared/components/PageHeader';
import { TextField } from '../../../shared/components/TextField';
import { changePassword, getStoredUser } from '../services/authService';

export function AlterarSenhaPage() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (newPassword !== confirm) {
      setError('As senhas nao coincidem');
      return;
    }

    if (!user) return;

    try {
      setLoading(true);
      await changePassword(user.email, newPassword);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel alterar a senha');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="stack" style={{ maxWidth: 480, margin: '0 auto', paddingTop: '2rem' }}>
      <PageHeader
        title="Criar senha definitiva"
        description="Sua conta foi ativada com uma senha temporaria. Defina agora sua senha permanente para continuar."
      />
      <section className="work-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          {error ? <Alert tone="error">{error}</Alert> : null}
          <TextField
            label="Nova senha"
            type="password"
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <TextField
            label="Confirmar senha"
            type="password"
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <Button type="submit" icon={<KeyRound size={16} />} disabled={loading}>
            {loading ? 'Salvando...' : 'Definir senha e entrar'}
          </Button>
        </form>
      </section>
    </section>
  );
}
