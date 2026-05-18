import { Coins, Gift, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { resgatarVantagem } from '../services/vantagemService';
import type { Resgate, Vantagem } from '../types/vantagem';

type Props = {
  vantagem: Vantagem;
  canRedeem?: boolean;
  onRedeemed?: (resgate: Resgate) => void;
};

export function VantagemCard({ vantagem, canRedeem = false, onRedeemed }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [redeemed, setRedeemed] = useState<Resgate | null>(null);

  async function handleRedeem() {
    if (!window.confirm(`Deseja resgatar "${vantagem.title}" por ${vantagem.costInCoins} moedas?`)) return;
    setError('');
    setLoading(true);
    try {
      const resgate = await resgatarVantagem(vantagem.id);
      setRedeemed(resgate);
      onRedeemed?.(resgate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel resgatar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      background: 'var(--color-surface, #fff)',
      border: '1px solid var(--color-border, #e2e8f0)',
      borderRadius: '10px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {vantagem.imageUrl ? (
        <img
          src={vantagem.imageUrl}
          alt={vantagem.title}
          style={{ width: '100%', height: '160px', objectFit: 'cover' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : (
        <div style={{ width: '100%', height: '160px', background: 'var(--color-border-subtle, #f1f5f9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Gift size={40} style={{ opacity: 0.3 }} />
        </div>
      )}

      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <strong style={{ fontSize: '1rem', lineHeight: 1.3 }}>{vantagem.title}</strong>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#dbeafe', color: '#1d4ed8', borderRadius: '9999px', padding: '0.2rem 0.6rem', fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
            <Coins size={12} />
            {vantagem.costInCoins}
          </span>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted, #64748b)', margin: 0, lineHeight: 1.5 }}>
          {vantagem.description}
        </p>

        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #94a3b8)', margin: 0 }}>
          {vantagem.partner.name}
        </p>

        {error ? <Alert tone="error">{error}</Alert> : null}

        {redeemed ? (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '0.75rem', textAlign: 'center', marginTop: 'auto' }}>
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', color: '#15803d', fontWeight: 600 }}>Resgatado! Cupom enviado por email.</p>
            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.2em', color: '#166534' }}>{redeemed.code}</p>
          </div>
        ) : canRedeem ? (
          <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
            <Button
              icon={<ShoppingBag size={14} />}
              disabled={loading}
              onClick={() => void handleRedeem()}
              style={{ width: '100%' }}
            >
              {loading ? 'Resgatando...' : 'Resgatar'}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
