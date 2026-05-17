import { apiClient } from '../../../shared/http/apiClient';
import type { CreateParceiroInput, Parceiro, UpdateParceiroInput } from '../types/parceiro';

export async function listParceiros(): Promise<Parceiro[]> {
  const result = await apiClient<{ data: Parceiro[] }>('/api/parceiros?limit=200');
  return result.data;
}

export function createParceiro(input: CreateParceiroInput) {
  return apiClient<Parceiro>('/api/parceiros', {
    method: 'POST',
    body: input
  });
}

export function getParceiro(id: string) {
  return apiClient<Parceiro>(`/api/parceiros/${id}`);
}

export function updateParceiro(id: string, input: UpdateParceiroInput) {
  return apiClient<Parceiro>(`/api/parceiros/${id}`, {
    method: 'PUT',
    body: input
  });
}

export function deleteParceiro(id: string) {
  return apiClient<void>(`/api/parceiros/${id}`, {
    method: 'DELETE'
  });
}
