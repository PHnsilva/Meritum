import { apiClient } from '../../../shared/http/apiClient';
import type { CreateVantagemInput, Resgate, UpdateVantagemInput, Vantagem } from '../types/vantagem';

export function listVantagens(): Promise<Vantagem[]> {
  return apiClient<Vantagem[]>('/api/vantagens');
}

export function listMinhasVantagens(): Promise<Vantagem[]> {
  return apiClient<Vantagem[]>('/api/vantagens/minhas');
}

export function listTodasVantagens(): Promise<Vantagem[]> {
  return apiClient<Vantagem[]>('/api/vantagens/admin');
}

export function getVantagem(id: string): Promise<Vantagem> {
  return apiClient<Vantagem>(`/api/vantagens/${id}`);
}

export function createVantagem(input: CreateVantagemInput): Promise<Vantagem> {
  return apiClient<Vantagem>('/api/vantagens', { method: 'POST', body: input });
}

export function updateVantagem(id: string, input: UpdateVantagemInput): Promise<Vantagem> {
  return apiClient<Vantagem>(`/api/vantagens/${id}`, { method: 'PUT', body: input });
}

export function deleteVantagem(id: string): Promise<void> {
  return apiClient<void>(`/api/vantagens/${id}`, { method: 'DELETE' });
}

export function resgatarVantagem(id: string): Promise<Resgate> {
  return apiClient<Resgate>(`/api/vantagens/${id}/resgatar`, { method: 'POST' });
}

export function listMeusResgates(): Promise<Resgate[]> {
  return apiClient<Resgate[]>('/api/resgates');
}

export function listResgatesByAluno(studentId: string): Promise<Resgate[]> {
  return apiClient<Resgate[]>(`/api/resgates?studentId=${studentId}`);
}

export function listResgatesByVantagem(id: string): Promise<Resgate[]> {
  return apiClient<Resgate[]>(`/api/vantagens/${id}/resgates`);
}

export function listPartnerResgates(): Promise<Resgate[]> {
  return apiClient<Resgate[]>('/api/vantagens/resgates');
}

export function listPartnerResgatesByAdmin(partnerId: string): Promise<Resgate[]> {
  return apiClient<Resgate[]>(`/api/vantagens/resgates?partnerId=${partnerId}`);
}
