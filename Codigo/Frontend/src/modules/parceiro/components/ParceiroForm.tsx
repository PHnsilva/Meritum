import { Save } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { TextField } from '../../../shared/components/TextField';
import { formatCnpj, onlyDigits } from '../../../shared/utils/formatters';
import { isValidEmail } from '../../../shared/utils/validators';
import type { CreateParceiroInput, UpdateParceiroInput } from '../types/parceiro';

type ParceiroFormProps = {
  initialValue?: Omit<CreateParceiroInput, 'password'>;
  submitLabel?: string;
  requirePassword?: boolean;
  onSubmit: (input: CreateParceiroInput | UpdateParceiroInput) => Promise<void>;
};

const initialState: CreateParceiroInput = {
  corporateName: '',
  tradeName: '',
  email: '',
  cnpj: '',
  address: '',
  password: ''
};

export function ParceiroForm({ initialValue, submitLabel = 'Salvar parceiro', requirePassword = true, onSubmit }: ParceiroFormProps) {
  const [form, setForm] = useState<CreateParceiroInput>({
    ...initialState,
    ...initialValue,
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField(field: keyof CreateParceiroInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!isValidEmail(form.email)) {
      setError('Informe um email valido para a empresa parceira');
      return;
    }

    if (onlyDigits(form.cnpj).length !== 14) {
      setError('Informe um CNPJ com 14 digitos');
      return;
    }

    if (requirePassword && form.password.length < 6) {
      setError('Informe uma senha com pelo menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      const payload: CreateParceiroInput | UpdateParceiroInput = {
        ...form,
        email: form.email.trim(),
        cnpj: onlyDigits(form.cnpj)
      };

      if (!form.password) {
        delete payload.password;
      }

      await onSubmit(payload);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Nao foi possivel cadastrar a empresa parceira');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      {error ? <Alert tone="error">{error}</Alert> : null}
      <TextField label="Razao social" value={form.corporateName} onChange={(event) => updateField('corporateName', event.target.value)} required />
      <TextField label="Nome fantasia" value={form.tradeName} onChange={(event) => updateField('tradeName', event.target.value)} />
      <TextField label="Email" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} required />
      <TextField
        label="CNPJ"
        inputMode="numeric"
        maxLength={18}
        placeholder="00.000.000/0000-00"
        value={form.cnpj}
        onChange={(event) => updateField('cnpj', formatCnpj(event.target.value))}
        required
      />
      <TextField label="Endereco" value={form.address} onChange={(event) => updateField('address', event.target.value)} required />
      <TextField
        label={requirePassword ? 'Senha' : 'Nova senha'}
        type="password"
        minLength={6}
        value={form.password}
        onChange={(event) => updateField('password', event.target.value)}
        hint={requirePassword ? undefined : 'Preencha apenas se desejar alterar a senha'}
        required={requirePassword}
      />
      <div className="form-grid__actions">
        <Button type="submit" icon={<Save size={16} />} disabled={loading}>
          {loading ? 'Salvando...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
