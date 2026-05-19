import type { PrismaTx } from '../../../shared/infra/unit-of-work.js';
import type { AdvantageEntity } from './advantage.entity.js';

export type CreateAdvantageData = {
  partnerId: string;
  title: string;
  description: string;
  imageUrl?: string;
  costInCoins: number;
};

export type UpdateAdvantageData = Partial<Omit<CreateAdvantageData, 'partnerId'> & { isActive: boolean }>;

export type AdvantageReadModel = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  costInCoins: number;
  isActive: boolean;
  partnerId: string;
  partner: {
    id: string;
    corporateName: string;
    tradeName: string | null;
    user: { email: string };
  };
  createdAt: Date;
  updatedAt: Date;
};

export type RedemptionReadModel = {
  id: string;
  code: string;
  coinCost: number;
  createdAt: Date;
  advantageId: string;
  studentId: string;
  advantage: {
    id: string;
    title: string;
    partner: { corporateName: string };
  };
  student: {
    id: string;
    user: { name: string; email: string };
  };
};

export type CreateRedemptionData = {
  code: string;
  coinCost: number;
  studentId: string;
  advantageId: string;
};

export interface AdvantageRepository {
  /** Lightweight entity load — for domain rule checks (ownership, availability). */
  findById(id: string): Promise<AdvantageEntity | null>;
  /** Full read model with partner info — for API responses and email sends. */
  findByIdWithPartner(id: string): Promise<AdvantageReadModel | null>;
  /** Active advantages only. */
  list(): Promise<AdvantageReadModel[]>;
  listByPartner(partnerId: string): Promise<AdvantageReadModel[]>;
  listAll(): Promise<AdvantageReadModel[]>;
  create(data: CreateAdvantageData): Promise<AdvantageReadModel>;
  update(id: string, data: UpdateAdvantageData): Promise<AdvantageReadModel>;
  delete(id: string): Promise<void>;
  /** Creates a redemption record inside an existing transaction. */
  createRedemption(data: CreateRedemptionData, tx: PrismaTx): Promise<RedemptionReadModel>;
  listRedemptionsByStudent(studentId: string): Promise<RedemptionReadModel[]>;
  listRedemptionsByAdvantage(advantageId: string, filter?: { studentId?: string }): Promise<RedemptionReadModel[]>;
  listRedemptionsByPartner(partnerId: string): Promise<RedemptionReadModel[]>;
}
