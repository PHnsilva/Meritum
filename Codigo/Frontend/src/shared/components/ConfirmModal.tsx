import { Button } from './Button';
import { Modal } from './Modal';

type Props = {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
};

export function ConfirmModal({ title, message, confirmLabel = 'Confirmar', onConfirm, onCancel, danger = false }: Props) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p style={{ margin: '0 0 1.25rem', color: 'var(--color-ink)' }}>{message}</p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
