import { apiClient } from '../../../shared/http/apiClient';
import type { CreateProfessorInput, Professor, UpdateProfessorInput } from '../types/professor';

export function listProfessores() {
  return apiClient<Professor[]>('/api/professores');
}

export function getProfessor(id: string) {
  return apiClient<Professor>(`/api/professores/${id}`);
}

export function createProfessor(input: CreateProfessorInput) {
  return apiClient<Professor>('/api/professores', {
    method: 'POST',
    body: input
  });
}

export function updateProfessor(id: string, input: UpdateProfessorInput) {
  return apiClient<Professor>(`/api/professores/${id}`, {
    method: 'PUT',
    body: input
  });
}

export function deleteProfessor(id: string) {
  return apiClient<void>(`/api/professores/${id}`, { method: 'DELETE' });
}
