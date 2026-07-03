import { useCallback, useEffect, useState } from 'react';

type UseResourceListOptions<T> = {
  /** Busca a lista no backend. */
  fetcher: () => Promise<T[]>;
  /** Remove um item pelo id (usado por confirmDelete/handleDeleteConfirmed). */
  remover?: (id: string) => Promise<void>;
  /** Mensagem exibida quando o carregamento falha. */
  loadErrorMessage: string;
  /** Mensagem exibida quando a remoção falha. */
  deleteErrorMessage?: string;
};

/**
 * Estado padrão das páginas de listagem (alunos, professores, parceiros...):
 * carregamento, erro, recarga e exclusão com modal de confirmação.
 *
 * Antes, cada *ListPage duplicava os mesmos useState/try/catch.
 */
export function useResourceList<T>({ fetcher, remover, loadErrorMessage, deleteErrorMessage }: UseResourceListOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await fetcher());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : loadErrorMessage);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDeleteConfirmed() {
    if (!confirmDeleteId || !remover) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    try {
      await remover(id);
      await load();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : (deleteErrorMessage ?? loadErrorMessage));
    }
  }

  useEffect(() => { void load(); }, [load]);

  return {
    items,
    loading,
    error,
    setError,
    load,
    confirmDeleteId,
    setConfirmDeleteId,
    handleDeleteConfirmed
  };
}
