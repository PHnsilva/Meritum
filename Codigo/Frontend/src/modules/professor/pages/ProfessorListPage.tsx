import { Coins, Edit3, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { PageHeader } from '../../../shared/components/PageHeader';
import { formatCpf } from '../../../shared/utils/formatters';
import { deleteProfessor, listProfessores } from '../services/professorService';
import type { Professor } from '../types/professor';

export function ProfessorListPage() {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      setProfessores(await listProfessores());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel carregar os professores');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Deseja remover este professor?')) return;
    try {
      await deleteProfessor(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel remover o professor');
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <section className="stack">
      <PageHeader
        title="Professores"
        description="Gerencie professores pre-cadastrados pelas instituicoes parceiras."
        actions={
          <>
            <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={() => void load()}>
              Atualizar
            </Button>
            <Link className="button button--primary" to="/professores/novo">
              <Plus size={16} />
              <span>Novo professor</span>
            </Link>
          </>
        }
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="table-card">
        {loading ? (
          <div className="empty-state">Carregando professores...</div>
        ) : professores.length === 0 ? (
          <div className="empty-state">
            <strong>Nenhum professor cadastrado</strong>
            <span>Use o botao novo professor para iniciar o cadastro.</span>
          </div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Departamento</th>
                  <th>Instituicao</th>
                  <th>Saldo</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {professores.map((professor) => (
                  <tr key={professor.id}>
                    <td>
                      <strong>{professor.name}</strong>
                      <span>{professor.email}</span>
                    </td>
                    <td>{formatCpf(professor.cpf)}</td>
                    <td>{professor.department}</td>
                    <td>{professor.institution.name}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Coins size={14} />
                        {professor.coinBalance}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link className="icon-button" to={`/professores/${professor.id}/editar`} aria-label="Editar professor">
                          <Edit3 size={16} />
                        </Link>
                        <button
                          className="icon-button icon-button--danger"
                          type="button"
                          onClick={() => void handleDelete(professor.id)}
                          aria-label="Remover professor"
                        >
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
