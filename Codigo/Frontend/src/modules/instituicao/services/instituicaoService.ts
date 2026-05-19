import { apiClient } from '../../../shared/http/apiClient';
import type { CreateInstituicaoInput, Instituicao, RegisterInstituicaoInput, UpdateInstituicaoInput } from '../types/instituicao';

export function listInstituicoes() {
  return apiClient<Instituicao[]>('/api/instituicoes');
}

export function listInstituicoesAdmin(status?: 'PENDING' | 'APPROVED') {
  const qs = status ? `?status=${status}` : '';
  return apiClient<Instituicao[]>(`/api/instituicoes/admin${qs}`);
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

export function registerInstituicao(input: RegisterInstituicaoInput) {
  return apiClient<Instituicao>('/api/instituicoes/solicitar', {
    method: 'POST',
    body: input
  });
}

export function approveInstituicao(id: string) {
  return apiClient<Instituicao>(`/api/instituicoes/${id}/aprovar`, {
    method: 'POST'
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
