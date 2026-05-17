import { Save } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { SelectField } from '../../../shared/components/SelectField';
import { TextField } from '../../../shared/components/TextField';
import { formatCpf, onlyDigits } from '../../../shared/utils/formatters';
import { isValidEmail } from '../../../shared/utils/validators';
import { listInstituicoes } from '../../instituicao/services/instituicaoService';
import type { Instituicao } from '../../instituicao/types/instituicao';
import type { CreateProfessorInput, UpdateProfessorInput } from '../types/professor';

type ProfessorFormProps = {
  initialValue?: Omit<CreateProfessorInput, 'password'>;
  submitLabel?: string;
  requirePassword?: boolean;
  onSubmit: (input: CreateProfessorInput | UpdateProfessorInput) => Promise<void>;
};

const initialState: CreateProfessorInput = {
  name: '',
  email: '',
  cpf: '',
  department: '',
  institutionId: '',
  password: ''
};

export function ProfessorForm({ initialValue, submitLabel = 'Salvar professor', requirePassword = true, onSubmit }: ProfessorFormProps) {
  const [form, setForm] = useState<CreateProfessorInput>({ ...initialState, ...initialValue, password: '' });
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [loadingInstituicoes, setLoadingInstituicoes] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setInstituicoes(await listInstituicoes());
      } catch {
        setError('Nao foi possivel carregar as instituicoes');
      } finally {
        setLoadingInstituicoes(false);
      }
    }
    void load();
  }, []);

  function updateField(field: keyof CreateProfessorInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!isValidEmail(form.email)) {
      setError('Informe um email valido para o professor');
      return;
    }

    if (onlyDigits(form.cpf).length !== 11) {
      setError('Informe um CPF com 11 digitos');
      return;
    }

    if (!form.institutionId) {
      setError('Selecione a instituicao do professor');
      return;
    }

    if (requirePassword && form.password.length < 6) {
      setError('Informe uma senha com pelo menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      const payload: CreateProfessorInput | UpdateProfessorInput = {
        ...form,
        email: form.email.trim(),
        cpf: onlyDigits(form.cpf)
      };

      if (!form.password) {
        delete payload.password;
      }

      await onSubmit(payload);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Nao foi possivel salvar o professor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      {error ? <Alert tone="error">{error}</Alert> : null}
      <TextField label="Nome" value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
      <TextField label="Email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
      <TextField
        label="CPF"
        inputMode="numeric"
        maxLength={14}
        placeholder="000.000.000-00"
        value={form.cpf}
        onChange={(e) => updateField('cpf', formatCpf(e.target.value))}
        required
      />
      <TextField label="Departamento" value={form.department} onChange={(e) => updateField('department', e.target.value)} required />
      <SelectField
        label="Instituicao"
        value={form.institutionId}
        onChange={(e) => updateField('institutionId', e.target.value)}
        placeholder={loadingInstituicoes ? 'Carregando instituicoes...' : 'Selecione a instituicao'}
        options={instituicoes.map((i) => ({ value: i.id, label: i.name }))}
        disabled={loadingInstituicoes || instituicoes.length === 0}
        required
      />
      <TextField
        label={requirePassword ? 'Senha' : 'Nova senha'}
        type="password"
        minLength={6}
        value={form.password}
        onChange={(e) => updateField('password', e.target.value)}
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
