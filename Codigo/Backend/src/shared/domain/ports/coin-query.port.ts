export type InstitutionCoinTransactionReadModel = {
  id: string;
  amount: number;
  motive: string;
  createdAt: Date;
  professor: { name: string; email: string; department: string };
  student: { name: string; email: string; course: string };
};

export interface CoinQueryPort {
  getInstitutionTransactions(institutionId: string): Promise<InstitutionCoinTransactionReadModel[]>;
}
