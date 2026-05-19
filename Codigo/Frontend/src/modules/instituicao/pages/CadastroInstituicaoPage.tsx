import { ArrowLeft, CheckCircle, Landmark } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { TextField } from '../../../shared/components/TextField';
import { ThemeToggle } from '../../../shared/components/ThemeToggle';
import { registerInstituicao } from '../services/instituicaoService';
import { AuthPageWrapper } from '../../auth/components/AuthPageWrapper';
import { School } from 'lucide-react';

export function CadastroInstituicaoPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (form.name.trim().length < 2) { setError('Informe o nome da instituicao'); return; }
    if (!form.email) { setError('Informe o email de acesso'); return; }
    if (form.password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres'); return; }

    try {
      setLoading(true);
      await registerInstituicao({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel enviar a solicitacao');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageWrapper>
      <div className="login-card__tools">
        <ThemeToggle />
      </div>

      {success ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem 0', textAlign: 'center' }}>
          <CheckCircle size={48} style={{ color: 'var(--color-success, #16a34a)' }} />
          <h1 style={{ margin: 0 }}>Solicitacao enviada!</h1>
          <p style={{ color: 'var(--color-text-muted, #64748b)', maxWidth: '340px' }}>
            Seu cadastro foi recebido e esta aguardando a aprovacao da administracao.
            Voce sera notificado por email quando sua conta for ativada.
          </p>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            <ArrowLeft size={14} />
            Voltar ao login
          </Link>
        </div>
      ) : (
        <>
          <div className="login-card__header">
            <p className="eyebrow">
              <Landmark size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} />
              Instituicao de ensino
            </p>
            <h1>Solicitar cadastro</h1>
            <span>Preencha os dados da sua instituicao. Apos a analise, voce recebera um email confirmando o acesso.</span>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            {error ? <Alert tone="error">{error}</Alert> : null}
            <TextField
              label="Nome da instituicao"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="PUC Minas - Campus Lourdes"
              required
            />
            <TextField
              label="Email de acesso"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="instituicao@exemplo.edu.br"
              required
            />
            <TextField
              label="Senha"
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder="Minimo 6 caracteres"
              required
            />
            <div className="form-grid__actions">
              <Button type="submit" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar solicitacao'}
              </Button>
            </div>
          </form>

          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
              <ArrowLeft size={14} />
              Voltar ao login
            </Link>
          </div>
        </>
      )}
    </AuthPageWrapper>
  );
}
