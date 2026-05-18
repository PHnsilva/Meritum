import { Save } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { TextField } from '../../../shared/components/TextField';
import type { CreateVantagemInput } from '../types/vantagem';

type Props = {
  initialValue?: Partial<CreateVantagemInput>;
  submitLabel?: string;
  onSubmit: (input: CreateVantagemInput) => Promise<void>;
};

export function VantagemForm({ initialValue, submitLabel = 'Salvar vantagem', onSubmit }: Props) {
  const [form, setForm] = useState<CreateVantagemInput>({
    title: initialValue?.title ?? '',
    description: initialValue?.description ?? '',
    imageUrl: initialValue?.imageUrl ?? '',
    costInCoins: initialValue?.costInCoins ?? 1
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update<K extends keyof CreateVantagemInput>(field: K, value: CreateVantagemInput[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (form.costInCoins < 1) {
      setError('O custo deve ser de pelo menos 1 moeda');
      return;
    }
    try {
      setLoading(true);
      const payload: CreateVantagemInput = {
        ...form,
        imageUrl: form.imageUrl?.trim() || undefined
      };
      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel salvar a vantagem');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      {error ? <Alert tone="error">{error}</Alert> : null}
      <TextField
        label="Titulo"
        value={form.title}
        onChange={(e) => update('title', e.target.value)}
        required
        minLength={2}
      />
      <TextField
        label="Descricao"
        value={form.description}
        onChange={(e) => update('description', e.target.value)}
        required
        minLength={5}
      />
      <TextField
        label="URL da imagem"
        type="url"
        value={form.imageUrl ?? ''}
        onChange={(e) => update('imageUrl', e.target.value)}
        hint="Opcional — deixe em branco para exibir icone padrao"
      />
      <TextField
        label="Custo em moedas"
        type="number"
        inputMode="numeric"
        min={1}
        value={String(form.costInCoins)}
        onChange={(e) => update('costInCoins', Number(e.target.value))}
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
