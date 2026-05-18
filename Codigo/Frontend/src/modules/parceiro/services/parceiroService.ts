import { apiClient } from '../../../shared/http/apiClient';
import type { CreateParceiroInput, Parceiro, UpdateParceiroInput } from '../types/parceiro';

export async function listParceiros(status?: 'PENDING' | 'APPROVED'): Promise<Parceiro[]> {
  const qs = status ? `status=${status}&limit=200` : 'limit=200';
  const result = await apiClient<{ data: Parceiro[] }>(`/api/parceiros?${qs}`);
  return result.data;
}

export function registerParceiro(input: CreateParceiroInput) {
  return apiClient<Parceiro>('/api/parceiros/solicitar', {
    method: 'POST',
    body: input
  });
}

export function approveParceiro(id: string) {
  return apiClient<Parceiro>(`/api/parceiros/${id}/aprovar`, {
    method: 'POST'
  });
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
