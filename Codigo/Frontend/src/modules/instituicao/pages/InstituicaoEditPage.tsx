import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { PageHeader } from '../../../shared/components/PageHeader';
import { getInstituicao, updateInstituicao } from '../services/instituicaoService';
import type { Instituicao, UpdateInstituicaoInput } from '../types/instituicao';

export function InstituicaoEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [instituicao, setInstituicao] = useState<Instituicao | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const inst = await getInstituicao(id);
        setInstituicao(inst);
        setName(inst.name);
        setEmail(inst.userEmail ?? '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Nao foi possivel carregar a instituicao');
      }
    }
    void load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setError('');
    setSubmitting(true);
    try {
      const input: UpdateInstituicaoInput = {};
      if (name.trim() && name.trim() !== instituicao?.name) input.name = name.trim();
      if (email.trim()) input.email = email.trim();
      if (password.trim()) input.password = password.trim();
      await updateInstituicao(id, input);
      navigate('/instituicoes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel atualizar a instituicao');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="stack">
      <PageHeader
        title="Editar instituicao"
        description="Atualize os dados da instituicao e do usuario vinculado."
        actions={
          <Link className="button button--secondary" to="/instituicoes">
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </Link>
        }
      />
      <section className="work-panel">
        {error ? <Alert tone="error">{error}</Alert> : null}
        {!error && !instituicao ? (
          <div className="empty-state">Carregando instituicao...</div>
        ) : instituicao ? (
          <form className="stack" style={{ maxWidth: 480 }} onSubmit={(e) => void handleSubmit(e)}>
            <div className="field">
              <label htmlFor="inst-name">Nome da instituicao</label>
              <input
                id="inst-name"
                type="text"
                value={name}
                minLength={2}
                required
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="inst-email">Email do usuario vinculado</label>
              <input
                id="inst-email"
                type="email"
                value={email}
                placeholder={instituicao.userEmail ?? 'Sem usuario vinculado'}
                onChange={(e) => setEmail(e.target.value)}
              />
              <span className="field-hint">Deixe vazio para manter o email atual.</span>
            </div>
            <div className="field">
              <label htmlFor="inst-password">Nova senha (opcional)</label>
              <input
                id="inst-password"
                type="password"
                value={password}
                minLength={6}
                placeholder="Nova senha (minimo 6 caracteres)"
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="field-hint">Deixe vazio para manter a senha atual.</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Salvando...' : 'Atualizar instituicao'}
              </Button>
            </div>
          </form>
        ) : null}
      </section>
    </section>
  );
}
