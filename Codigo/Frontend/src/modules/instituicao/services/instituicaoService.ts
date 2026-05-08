import { apiClient } from '../../../shared/http/apiClient';
import type { CreateInstituicaoInput, Instituicao, UpdateInstituicaoInput } from '../types/instituicao';

export function listInstituicoes() {
  return apiClient<Instituicao[]>('/api/instituicoes');
}

export function getInstituicao(id: string) {
  return apiClient<Instituicao>(`/api/instituicoes/${id}`);
}

export function createInstituicao(input: CreateInstituicaoInput) {
  return apiClient<Instituicao>('/api/instituicoes', {
    method: 'POST',
    body: input
  });
}

export function updateInstituicao(id: string, input: UpdateInstituicaoInput) {
  return apiClient<Instituicao>(`/api/instituicoes/${id}`, {
    method: 'PUT',
    body: input
  });
}

export function deleteInstituicao(id: string) {
  return apiClient<void>(`/api/instituicoes/${id}`, {
    method: 'DELETE'
  });
}
