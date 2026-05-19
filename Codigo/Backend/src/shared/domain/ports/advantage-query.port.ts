export type InstitutionRedemptionReadModel = {
  id: string;
  code: string;
  coinCost: number;
  createdAt: Date;
  student: { name: string; email: string };
  advantage: { title: string; partner: { name: string } };
};

export interface AdvantageQueryPort {
  getInstitutionRedemptions(institutionId: string): Promise<InstitutionRedemptionReadModel[]>;
}
