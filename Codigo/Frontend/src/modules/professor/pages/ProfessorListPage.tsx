import { Coins, Edit3, FileText, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SearchInput } from '../../../shared/components/SearchInput';
import { formatCpf } from '../../../shared/utils/formatters';
import { getStoredUser } from '../../auth/services/authService';
import { deleteProfessor, listProfessores } from '../services/professorService';
import type { Professor } from '../types/professor';

export function ProfessorListPage() {
  const user = getStoredUser();
  const isInstitution = user?.role === 'institution';

  const [professores, setProfessores] = useState<Professor[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setProfessores(await listProfessores(isInstitution ? (user?.id ?? undefined) : undefined));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel carregar os professores');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteConfirmed() {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    try {
      await deleteProfessor(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel remover o professor');
    }
  }

  useEffect(() => { void load(); }, []);

  const q = query.toLowerCase();
  const filtered = professores.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.department.toLowerCase().includes(q) ||
      p.institution.name.toLowerCase().includes(q)
  );

  return (
    <>
      {confirmDeleteId && (
        <ConfirmModal
          title="Remover professor"
          message="Deseja remover este professor? A acao nao pode ser desfeita."
          confirmLabel="Remover"
          danger
          onConfirm={() => void handleDeleteConfirmed()}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
      <section className="stack">
        <PageHeader
          title="Professores"
          description={isInstitution ? 'Professores vinculados a sua instituicao.' : 'Gerencie professores pre-cadastrados pelas instituicoes.'}
          actions={
            <>
              <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={() => void load()}>
                Atualizar
              </Button>
              {!isInstitution && (
                <Link className="button button--primary" to="/professores/novo">
                  <Plus size={16} />
                  <span>Novo professor</span>
                </Link>
              )}
            </>
          }
        />

        {error ? <Alert tone="error">{error}</Alert> : null}

        <div className="work-panel" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar por nome, email ou departamento..." />
        </div>

        <div className="table-card">
          {loading ? (
            <div className="empty-state">Carregando professores...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <strong>{professores.length === 0 ? 'Nenhum professor cadastrado' : 'Nenhum resultado para a busca'}</strong>
              <span>{professores.length === 0 ? 'Nenhum professor vinculado.' : 'Tente outros termos.'}</span>
            </div>
          ) : (
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>CPF</th>
                    <th>Departamento</th>
                    {!isInstitution && <th>Instituicao</th>}
                    <th>Saldo</th>
                    {!isInstitution && <th>Acoes</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((professor) => (
                    <tr key={professor.id}>
                      <td>
                        <strong>{professor.name}</strong>
                        <span>{professor.email}</span>
                      </td>
                      <td>{formatCpf(professor.cpf)}</td>
                      <td>{professor.department}</td>
                      {!isInstitution && <td>{professor.institution.name}</td>}
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Coins size={14} />
                          {professor.coinBalance}
                        </span>
                      </td>
                      {!isInstitution && (
                        <td>
                          <div className="table-actions">
                            <Link className="icon-button" to={`/moedas/extrato/professor?id=${professor.id}&name=${encodeURIComponent(professor.name)}`} aria-label="Extrato do professor">
                              <FileText size={16} />
                            </Link>
                            <Link className="icon-button" to={`/professores/${professor.id}/editar`} aria-label="Editar professor">
                              <Edit3 size={16} />
                            </Link>
                            <button className="icon-button icon-button--danger" type="button" onClick={() => setConfirmDeleteId(professor.id)} aria-label="Remover professor">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
