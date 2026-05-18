import { Save, User } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { PageHeader } from '../../../shared/components/PageHeader';
import { TextField } from '../../../shared/components/TextField';
import { getAluno } from '../../aluno/services/alunoService';
import { getParceiro } from '../../parceiro/services/parceiroService';
import { getProfessor } from '../../professor/services/professorService';
import { getStoredUser, updatePerfil } from '../services/authService';

export function PerfilPage() {
  const user = getStoredUser()!;

  const [loading, setLoading] = useState(user.role !== 'admin');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [address, setAddress] = useState('');
  const [course, setCourse] = useState('');
  const [department, setDepartment] = useState('');
  const [corporateName, setCorporateName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [institution, setInstitution] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    async function fetch() {
      try {
        if (user.role === 'student') {
          const aluno = await getAluno(user.id);
          setName(aluno.name);
          setEmail(aluno.email);
          setCpf(aluno.cpf);
          setRg(aluno.rg);
          setAddress(aluno.address);
          setCourse(aluno.course);
          setInstitution(aluno.institution.name);
        } else if (user.role === 'professor') {
          const prof = await getProfessor(user.id);
          setName(prof.name);
          setEmail(prof.email);
          setCpf(prof.cpf);
          setDepartment(prof.department);
          setInstitution(prof.institution.name);
        } else if (user.role === 'partner') {
          const parceiro = await getParceiro(user.id);
          setCorporateName(parceiro.corporateName);
          setTradeName(parceiro.tradeName ?? '');
          setEmail(parceiro.email);
          setCnpj(parceiro.cnpj);
          setAddress(parceiro.address);
        }
      } catch {
        setError('Nao foi possivel carregar os dados do perfil');
      } finally {
        setLoading(false);
      }
    }
    if (user.role !== 'admin') void fetch();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      setError('As senhas nao conferem');
      return;
    }
    if (password && password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updatePerfil({
        name: user.role === 'partner' ? undefined : name,
        email,
        cpf: cpf || undefined,
        rg: rg || undefined,
        address: address || undefined,
        course: course || undefined,
        department: department || undefined,
        corporateName: user.role === 'partner' ? corporateName : undefined,
        tradeName: user.role === 'partner' ? tradeName : undefined,
        cnpj: cnpj || undefined,
        password: password || undefined
      });
      setSuccess('Perfil atualizado com sucesso!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel salvar as alteracoes');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="stack">
      <PageHeader
        title="Minha Conta"
        description="Visualize e edite suas informacoes pessoais."
      />

      {loading ? (
        <div className="empty-state">Carregando dados...</div>
      ) : (
        <section className="work-panel">
          {error ? <Alert tone="error">{error}</Alert> : null}
          {success ? <Alert tone="success">{success}</Alert> : null}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <User size={18} />
            <span style={{ fontWeight: 600 }}>
              {user.role === 'admin' && 'Administrador'}
              {user.role === 'student' && `Aluno — ${institution}`}
              {user.role === 'professor' && `Professor — ${institution}`}
              {user.role === 'partner' && 'Empresa Parceira'}
            </span>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            {user.role === 'partner' ? (
              <>
                <TextField label="Razao social" value={corporateName} onChange={(e) => setCorporateName(e.target.value)} required />
                <TextField label="Nome fantasia" value={tradeName} onChange={(e) => setTradeName(e.target.value)} />
                <TextField label="CNPJ" value={cnpj} onChange={(e) => setCnpj(e.target.value)} required />
                <TextField label="Endereco" value={address} onChange={(e) => setAddress(e.target.value)} required />
              </>
            ) : (
              <TextField label="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
            )}

            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

            {user.role === 'student' && (
              <>
                <TextField label="CPF" value={cpf} onChange={() => {}} readOnly hint="CPF nao pode ser alterado" />
                <TextField label="RG" value={rg} onChange={(e) => setRg(e.target.value)} />
                <TextField label="Curso" value={course} onChange={(e) => setCourse(e.target.value)} />
                <TextField label="Endereco" value={address} onChange={(e) => setAddress(e.target.value)} />
              </>
            )}

            {user.role === 'professor' && (
              <>
                <TextField label="CPF" value={cpf} onChange={() => {}} readOnly hint="CPF nao pode ser alterado" />
                <TextField label="Departamento" value={department} onChange={(e) => setDepartment(e.target.value)} />
              </>
            )}

            <TextField
              label="Nova senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hint="Deixe em branco para manter a senha atual"
            />
            {password && (
              <TextField
                label="Confirmar nova senha"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            )}

            <div className="form-grid__actions">
              <Button type="submit" icon={<Save size={16} />} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar alteracoes'}
              </Button>
            </div>
          </form>
        </section>
      )}
    </section>
  );
}
