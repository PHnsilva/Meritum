import { RefreshCw, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { Modal } from '../../../shared/components/Modal';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SearchInput } from '../../../shared/components/SearchInput';
import { getStoredUser } from '../../auth/services/authService';
import { VantagemCard } from '../components/VantagemCard';
import { listResgatesByVantagem, listVantagens } from '../services/vantagemService';
import type { Resgate, Vantagem } from '../types/vantagem';

export function VantagemCatalogPage() {
  const user = getStoredUser();
  const isStudent = user?.role === 'student';

  const [vantagens, setVantagens] = useState<Vantagem[]>([]);
  const [query, setQuery] = useState('');
  const [maxCost, setMaxCost] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modal, setModal] = useState<{ vantagem: Vantagem; resgates: Resgate[] } | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

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

  const q = query.toLowerCase();
  const maxC = maxCost ? parseInt(maxCost, 10) : Infinity;
  const filtered = vantagens.filter(
    (v) =>
      (v.title.toLowerCase().includes(q) || v.description.toLowerCase().includes(q) || v.partner.name.toLowerCase().includes(q)) &&
      v.costInCoins <= maxC
  );

  async function handleCardClick(v: Vantagem) {
    setModal({ vantagem: v, resgates: [] });
    setModalLoading(true);
    setModalError('');
    try {
      const resgates = await listResgatesByVantagem(v.id);
      setModal({ vantagem: v, resgates });
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Nao foi possivel carregar os resgates');
    } finally {
      setModalLoading(false);
    }
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

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchInput value={query} onChange={setQuery} placeholder="Buscar por titulo, descricao ou parceiro..." />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <label htmlFor="max-cost" style={{ fontSize: '0.8rem', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>Custo max.</label>
          <input
            id="max-cost"
            type="number"
            min={0}
            value={maxCost}
            onChange={(e) => setMaxCost(e.target.value)}
            placeholder="∞"
            style={{ width: 72, padding: '0.4rem 0.5rem', border: '1px solid var(--color-line)', borderRadius: '6px', background: 'var(--color-surface)', color: 'var(--color-ink)', fontSize: '0.875rem', outline: 'none' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Carregando vantagens...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <strong>{vantagens.length === 0 ? 'Nenhuma vantagem disponivel' : 'Nenhum resultado para os filtros'}</strong>
          <span>{vantagens.length === 0 ? 'As empresas parceiras ainda nao cadastraram vantagens.' : 'Tente outros termos ou aumente o custo maximo.'}</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {filtered.map((v) => (
            <VantagemCard
              key={v.id}
              vantagem={v}
              canRedeem={isStudent}
              onClick={isStudent ? () => void handleCardClick(v) : undefined}
            />
          ))}
        </div>
      )}

      {modal ? (
        <Modal
          title={`Meus resgates — ${modal.vantagem.title}`}
          onClose={() => setModal(null)}
        >
          {modalError ? <Alert tone="error">{modalError}</Alert> : null}
          {modalLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-muted)' }}>Carregando...</div>
          ) : modal.resgates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-muted)' }}>
              <ShoppingBag size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
              <p style={{ margin: 0 }}>Voce ainda nao resgatou esta vantagem.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {modal.resgates.map((r) => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--color-surface-strong)', borderRadius: '6px', border: '1px solid var(--color-line)', gap: '0.5rem' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-ink)' }}>
                      {new Date(r.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted)' }}>{r.coinCost} moedas debitadas</p>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-success)', fontWeight: 600 }}>Resgatado</span>
                </div>
              ))}
            </div>
          )}
        </Modal>
      ) : null}
    </section>
  );
}
