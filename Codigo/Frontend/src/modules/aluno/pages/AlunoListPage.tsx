import { Edit3, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { PageHeader } from '../../../shared/components/PageHeader';
import { formatCpf } from '../../../shared/utils/formatters';
import { deleteAluno, listAlunos } from '../services/alunoService';
import type { Aluno } from '../types/aluno';

export function AlunoListPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadAlunos() {
    setLoading(true);
    setError('');

    try {
      setAlunos(await listAlunos());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar alunos');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Deseja remover este aluno?')) {
      return;
    }

    try {
      await deleteAluno(id);
      await loadAlunos();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Nao foi possivel remover o aluno');
    }
  }

  useEffect(() => {
    void loadAlunos();
  }, []);

  return (
    <section className="stack">
      <PageHeader
        title="Alunos"
        description="Consulte os alunos cadastrados, seus vinculos institucionais e saldo inicial de moedas."
        actions={
          <>
            <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={() => void loadAlunos()}>
              Atualizar
            </Button>
            <Link className="button button--primary" to="/alunos/novo">
              <Plus size={16} />
              <span>Novo aluno</span>
            </Link>
          </>
        }
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="table-card">
        {loading ? (
          <div className="empty-state">Carregando alunos...</div>
        ) : alunos.length === 0 ? (
          <div className="empty-state">
            <strong>Nenhum aluno cadastrado</strong>
            <span>Use o botao novo aluno para iniciar o cadastro.</span>
          </div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>CPF</th>
                  <th>Curso</th>
                  <th>Instituicao</th>
                  <th>Moedas</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {alunos.map((aluno) => (
                  <tr key={aluno.id}>
                    <td>
                      <strong>{aluno.name}</strong>
                      <span>{aluno.email}</span>
                    </td>
                    <td>{formatCpf(aluno.cpf)}</td>
                    <td>{aluno.course}</td>
                    <td>{aluno.institution.name}</td>
                    <td>{aluno.coinBalance}</td>
                    <td>
                      <div className="table-actions">
                        <Link className="icon-button" to={`/alunos/${aluno.id}/editar`} aria-label="Editar aluno">
                          <Edit3 size={16} />
                        </Link>
                        <button className="icon-button icon-button--danger" type="button" onClick={() => void handleDelete(aluno.id)} aria-label="Remover aluno">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
