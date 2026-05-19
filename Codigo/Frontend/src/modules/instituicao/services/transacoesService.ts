import { apiClient } from '../../../shared/http/apiClient';

export type InstitutionTransaction = {
  id: string;
  amount: number;
  motive: string;
  createdAt: string;
  professor: { name: string; email: string; department: string };
  student: { name: string; email: string; course: string };
};

export type InstitutionRedemption = {
  id: string;
  code: string;
  coinCost: number;
  createdAt: string;
  student: { name: string; email: string };
  advantage: { title: string; partner: { name: string } };
};

export type InstitutionTransacoesResponse = {
  transactions: InstitutionTransaction[];
  redemptions: InstitutionRedemption[];
};

export function getInstituicaoTransacoes() {
  return apiClient<InstitutionTransacoesResponse>('/api/instituicoes/minha/transacoes');
}

export function getInstituicaoTransacoesByAdmin(institutionId: string) {
  return apiClient<InstitutionTransacoesResponse>(`/api/instituicoes/${institutionId}/transacoes`);
}
