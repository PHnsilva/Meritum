import { Search, X } from 'lucide-react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export function SearchInput({ value, onChange, placeholder = 'Buscar...' }: Props) {
  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 180, maxWidth: 340 }}>
      <Search size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none' }} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', padding: '0.45rem 2rem 0.45rem 2.1rem', border: '1px solid var(--color-line)', borderRadius: '6px', background: 'var(--color-surface)', color: 'var(--color-ink)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', padding: 0, display: 'flex' }}
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
