import { Save } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { SelectField } from '../../../shared/components/SelectField';
import { TextField } from '../../../shared/components/TextField';
import { formatCpf, formatRg, onlyDigits } from '../../../shared/utils/formatters';
import { isValidEmail } from '../../../shared/utils/validators';
import { listInstituicoes } from '../../instituicao/services/instituicaoService';
import type { Instituicao } from '../../instituicao/types/instituicao';
import type { CreateAlunoInput, UpdateAlunoInput } from '../types/aluno';

type AlunoFormProps = {
  initialValue?: Omit<CreateAlunoInput, 'password'>;
  submitLabel?: string;
  requirePassword?: boolean;
  onSubmit: (input: CreateAlunoInput | UpdateAlunoInput) => Promise<void>;
};

const initialState: CreateAlunoInput = {
  name: '',
  email: '',
  cpf: '',
  rg: '',
  address: '',
  institutionId: '',
  course: '',
  password: ''
};

export function AlunoForm({ initialValue, submitLabel = 'Salvar aluno', requirePassword = true, onSubmit }: AlunoFormProps) {
  const [form, setForm] = useState<CreateAlunoInput>({
    ...initialState,
    ...initialValue,
    password: ''
  });
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [loadingInstituicoes, setLoadingInstituicoes] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadInstituicoes() {
      try {
        setInstituicoes(await listInstituicoes());
      } catch {
        setError('Nao foi possivel carregar as instituicoes');
      } finally {
        setLoadingInstituicoes(false);
      }
    }

    void loadInstituicoes();
  }, []);

  function updateField(field: keyof CreateAlunoInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!isValidEmail(form.email)) {
      setError('Informe um email valido para o aluno');
      return;
    }

    if (onlyDigits(form.cpf).length !== 11) {
      setError('Informe um CPF com 11 digitos');
      return;
    }

    if (!form.institutionId) {
      setError('Selecione a instituicao do aluno');
      return;
    }

    if (requirePassword && form.password.length < 6) {
      setError('Informe uma senha com pelo menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      const payload: CreateAlunoInput | UpdateAlunoInput = {
        ...form,
        email: form.email.trim(),
        cpf: onlyDigits(form.cpf)
      };

      if (!form.password) {
        delete payload.password;
      }

      await onSubmit(payload);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Nao foi possivel cadastrar o aluno');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      {error ? <Alert tone="error">{error}</Alert> : null}
      <TextField label="Nome" value={form.name} onChange={(event) => updateField('name', event.target.value)} required />
      <TextField label="Email" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} required />
      <TextField
        label="CPF"
        inputMode="numeric"
        maxLength={14}
        placeholder="000.000.000-00"
        value={form.cpf}
        onChange={(event) => updateField('cpf', formatCpf(event.target.value))}
        required
      />
      <TextField
        label="RG"
        maxLength={13}
        placeholder="MG-00.000.000"
        value={form.rg}
        onChange={(event) => updateField('rg', formatRg(event.target.value))}
        required
      />
      <TextField label="Endereco" value={form.address} onChange={(event) => updateField('address', event.target.value)} required />
      <TextField label="Curso" value={form.course} onChange={(event) => updateField('course', event.target.value)} required />
      <SelectField
        label="Instituicao"
        value={form.institutionId}
        onChange={(event) => updateField('institutionId', event.target.value)}
        placeholder={loadingInstituicoes ? 'Carregando instituicoes...' : 'Selecione a instituicao'}
        options={instituicoes.map((instituicao) => ({
          value: instituicao.id,
          label: instituicao.name
        }))}
        disabled={loadingInstituicoes || instituicoes.length === 0}
        required
      />
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
