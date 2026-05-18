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
  onClick?: () => void;
};

export function VantagemCard({ vantagem, canRedeem = false, onRedeemed, onClick }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [redeemed, setRedeemed] = useState(false);

  async function handleRedeem(e: React.MouseEvent) {
    e.stopPropagation();
    if (!window.confirm(`Deseja resgatar "${vantagem.title}" por ${vantagem.costInCoins} moedas?`)) return;
    setError('');
    setLoading(true);
    try {
      const resgate = await resgatarVantagem(vantagem.id);
      setRedeemed(true);
      onRedeemed?.(resgate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel resgatar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-line)',
        borderRadius: '10px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.15s'
      }}
      onMouseEnter={(e) => { if (onClick) (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'; }}
      onMouseLeave={(e) => { if (onClick) (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
    >
      {vantagem.imageUrl ? (
        <img
          src={vantagem.imageUrl}
          alt={vantagem.title}
          style={{ width: '100%', height: '160px', objectFit: 'cover' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : (
        <div style={{ width: '100%', height: '160px', background: 'var(--color-surface-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Gift size={40} style={{ opacity: 0.3 }} />
        </div>
      )}

      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <strong style={{ fontSize: '1rem', lineHeight: 1.3, color: 'var(--color-ink)' }}>{vantagem.title}</strong>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'var(--color-surface-strong)', color: 'var(--color-puc-blue)', borderRadius: '9999px', padding: '0.2rem 0.6rem', fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
            <Coins size={12} />
            {vantagem.costInCoins}
          </span>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: 0, lineHeight: 1.5 }}>
          {vantagem.description}
        </p>

        <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: 0 }}>
          {vantagem.partner.name}
        </p>

        {error ? <Alert tone="error">{error}</Alert> : null}

        {redeemed ? (
          <div style={{ background: 'var(--color-surface-strong)', border: '1px solid var(--color-line)', borderRadius: '6px', padding: '0.75rem', textAlign: 'center', marginTop: 'auto' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600 }}>Resgatado! Cupom enviado por email.</p>
          </div>
        ) : canRedeem ? (
          <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
            <Button
              icon={<ShoppingBag size={14} />}
              disabled={loading}
              onClick={(e) => void handleRedeem(e)}
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
