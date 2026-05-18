import { Coins, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { PageHeader } from '../../../shared/components/PageHeader';
import { getStoredUser } from '../../auth/services/authService';
import { VantagemCard } from '../components/VantagemCard';
import { listVantagens } from '../services/vantagemService';
import type { Resgate, Vantagem } from '../types/vantagem';

export function VantagemCatalogPage() {
  const user = getStoredUser();
  const isStudent = user?.role === 'student';

  const [vantagens, setVantagens] = useState<Vantagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      setVantagens(await listVantagens());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel carregar as vantagens');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  function handleRedeemed(resgate: Resgate, vantagemId: string) {
    setVantagens((prev) =>
      prev.map((v) =>
        v.id === vantagemId ? { ...v, costInCoins: v.costInCoins } : v
      )
    );
    void resgate;
  }

  return (
    <section className="stack">
      <PageHeader
        title="Catalogo de vantagens"
        description={isStudent ? 'Troque suas moedas por vantagens dos nossos parceiros.' : 'Vantagens disponiveis para alunos.'}
        actions={
          <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={() => void load()}>
            Atualizar
          </Button>
        }
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      {loading ? (
        <div className="empty-state">Carregando vantagens...</div>
      ) : vantagens.length === 0 ? (
        <div className="empty-state">
          <strong>Nenhuma vantagem disponivel</strong>
          <span>As empresas parceiras ainda nao cadastraram vantagens.</span>
        </div>
      ) : (
        <>
          {isStudent && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'var(--surface-2, #f8fafc)', borderRadius: 8, fontSize: '0.875rem' }}>
              <Coins size={16} />
              <span>Seu saldo e exibido no perfil. Voce so pode resgatar se tiver moedas suficientes.</span>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {vantagens.map((v) => (
              <VantagemCard
                key={v.id}
                vantagem={v}
                canRedeem={isStudent}
                onRedeemed={(resgate) => handleRedeemed(resgate, v.id)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
