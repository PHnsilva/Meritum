import { Edit3, FileText, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SearchInput } from '../../../shared/components/SearchInput';
import { useResourceList } from '../../../shared/hooks/useResourceList';
import { formatCpf } from '../../../shared/utils/formatters';
import { getStoredUser } from '../../auth/services/authService';
import { deleteAluno, listAlunos } from '../services/alunoService';
import type { Aluno } from '../types/aluno';

export function AlunoListPage() {
  const user = getStoredUser();
  const isInstitution = user?.role === 'institution';

  const [query, setQuery] = useState('');
  const {
    items: alunos,
    loading,
    error,
    load: loadAlunos,
    confirmDeleteId,
    setConfirmDeleteId,
    handleDeleteConfirmed
  } = useResourceList<Aluno>({
    fetcher: () => listAlunos(isInstitution ? (user?.id ?? undefined) : undefined),
    remover: deleteAluno,
    loadErrorMessage: 'Nao foi possivel carregar alunos',
    deleteErrorMessage: 'Nao foi possivel remover o aluno'
  });

  const q = query.toLowerCase();
  const filtered = alunos.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.course.toLowerCase().includes(q) ||
      a.institution.name.toLowerCase().includes(q)
  );

  return (
    <>
      {confirmDeleteId && (
        <ConfirmModal
          title="Remover aluno"
          message="Deseja remover este aluno? A acao nao pode ser desfeita."
          confirmLabel="Remover"
          danger
          onConfirm={() => void handleDeleteConfirmed()}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
      <section className="stack">
        <PageHeader
          title="Alunos"
          description={isInstitution ? 'Alunos vinculados a sua instituicao.' : 'Consulte os alunos cadastrados, seus vinculos institucionais e saldo de moedas.'}
          actions={
            <>
              <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={() => void loadAlunos()}>
                Atualizar
              </Button>
              {!isInstitution && (
                <Link className="button button--primary" to="/alunos/novo">
                  <Plus size={16} />
                  <span>Novo aluno</span>
                </Link>
              )}
            </>
          }
        />

        {error ? <Alert tone="error">{error}</Alert> : null}

        <div className="work-panel" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar por nome, email, curso ou instituicao..." />
        </div>

        <div className="table-card">
          {loading ? (
            <div className="empty-state">Carregando alunos...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <strong>{alunos.length === 0 ? 'Nenhum aluno cadastrado' : 'Nenhum resultado para a busca'}</strong>
              <span>{alunos.length === 0 ? 'Nenhum aluno vinculado.' : 'Tente outros termos.'}</span>
            </div>
          ) : (
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>CPF</th>
                    <th>Curso</th>
                    {!isInstitution && <th>Instituicao</th>}
                    <th>Moedas</th>
                    {!isInstitution && <th>Acoes</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((aluno) => (
                    <tr key={aluno.id}>
                      <td>
                        <strong>{aluno.name}</strong>
                        <span>{aluno.email}</span>
                      </td>
                      <td>{formatCpf(aluno.cpf)}</td>
                      <td>{aluno.course}</td>
                      {!isInstitution && <td>{aluno.institution.name}</td>}
                      <td>{aluno.coinBalance}</td>
                      {!isInstitution && (
                        <td>
                          <div className="table-actions">
                            <Link className="icon-button" to={`/moedas/extrato/aluno?id=${aluno.id}&name=${encodeURIComponent(aluno.name)}`} aria-label="Extrato do aluno">
                              <FileText size={16} />
                            </Link>
                            <Link className="icon-button" to={`/alunos/${aluno.id}/editar`} aria-label="Editar aluno">
                              <Edit3 size={16} />
                            </Link>
                            <button className="icon-button icon-button--danger" type="button" onClick={() => setConfirmDeleteId(aluno.id)} aria-label="Remover aluno">
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
