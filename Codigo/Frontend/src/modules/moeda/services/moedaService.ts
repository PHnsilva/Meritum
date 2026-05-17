import { apiClient } from '../../../shared/http/apiClient';
import type { EnviarMoedasInput, ExtratoResponse, Transaction } from '../types/moeda';

export function enviarMoedas(input: EnviarMoedasInput) {
  return apiClient<Transaction>('/api/moedas/enviar', {
    method: 'POST',
    body: input
  });
}

export function getExtratoProfessor(professorId: string) {
  return apiClient<ExtratoResponse>(`/api/moedas/extrato/professor/${professorId}`);
}

export function getExtratoAluno(studentId: string) {
  return apiClient<ExtratoResponse>(`/api/moedas/extrato/aluno/${studentId}`);
}
