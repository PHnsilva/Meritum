import { Save } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { TextField } from '../../../shared/components/TextField';
import type { CreateInstituicaoInput } from '../types/instituicao';

type InstituicaoFormProps = {
  initialValue?: CreateInstituicaoInput;
  submitLabel: string;
  onSubmit: (input: CreateInstituicaoInput) => Promise<void>;
};

export function InstituicaoForm({ initialValue, submitLabel, onSubmit }: InstituicaoFormProps) {
  const [form, setForm] = useState<CreateInstituicaoInput>({
    name: initialValue?.name ?? ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (form.name.trim().length < 2) {
      setError('Informe um nome com pelo menos 2 caracteres');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        name: form.name.trim()
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Nao foi possivel salvar a instituicao');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      {error ? <Alert tone="error">{error}</Alert> : null}
      <TextField
        label="Nome da instituicao"
        value={form.name}
        onChange={(event) => setForm({ name: event.target.value })}
        placeholder="PUC Minas - Campus Lourdes"
        required
      />
      <div className="form-grid__actions">
        <Button type="submit" icon={<Save size={16} />} disabled={loading}>
          {loading ? 'Salvando...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
