import { Edit3, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { PageHeader } from '../../../shared/components/PageHeader';
import { formatCnpj } from '../../../shared/utils/formatters';
import { deleteParceiro, listParceiros } from '../services/parceiroService';
import type { Parceiro } from '../types/parceiro';

export function ParceiroListPage() {
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadParceiros() {
    setLoading(true);
    setError('');

    try {
      setParceiros(await listParceiros());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar parceiros');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Deseja remover esta empresa parceira?')) {
      return;
    }

    try {
      await deleteParceiro(id);
      await loadParceiros();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Nao foi possivel remover a empresa parceira');
    }
  }

  useEffect(() => {
    void loadParceiros();
  }, []);

  return (
    <section className="stack">
      <PageHeader
        title="Empresas parceiras"
        description="Gerencie empresas que poderao oferecer vantagens para troca de moedas."
        actions={
          <>
            <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={() => void loadParceiros()}>
              Atualizar
            </Button>
            <Link className="button button--primary" to="/parceiros/novo">
              <Plus size={16} />
              <span>Novo parceiro</span>
            </Link>
          </>
        }
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="table-card">
        {loading ? (
          <div className="empty-state">Carregando parceiros...</div>
        ) : parceiros.length === 0 ? (
          <div className="empty-state">
            <strong>Nenhuma empresa parceira cadastrada</strong>
            <span>Use o botao novo parceiro para iniciar o cadastro.</span>
          </div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>CNPJ</th>
                  <th>Email</th>
                  <th>Endereco</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {parceiros.map((parceiro) => (
                  <tr key={parceiro.id}>
                    <td>
                      <strong>{parceiro.tradeName || parceiro.corporateName}</strong>
                      <span>{parceiro.corporateName}</span>
                    </td>
                    <td>{formatCnpj(parceiro.cnpj)}</td>
                    <td>{parceiro.email}</td>
                    <td>{parceiro.address}</td>
                    <td>
                      <div className="table-actions">
                        <Link className="icon-button" to={`/parceiros/${parceiro.id}/editar`} aria-label="Editar parceiro">
                          <Edit3 size={16} />
                        </Link>
                        <button className="icon-button icon-button--danger" type="button" onClick={() => void handleDelete(parceiro.id)} aria-label="Remover parceiro">
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
