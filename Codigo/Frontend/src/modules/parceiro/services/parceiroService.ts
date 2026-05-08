import { apiClient } from '../../../shared/http/apiClient';
import type { CreateParceiroInput, Parceiro, UpdateParceiroInput } from '../types/parceiro';

export function listParceiros() {
  return apiClient<Parceiro[]>('/api/parceiros');
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
