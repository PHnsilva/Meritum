import type { AdvantageEntity } from './advantage.entity.js';

export type CreateAdvantageData = {
  partnerId: string;
  title: string;
  description: string;
  imageUrl?: string;
  costInCoins: number;
};

export type UpdateAdvantageData = Partial<Omit<CreateAdvantageData, 'partnerId'> & { isActive: boolean }>;

export interface AdvantageRepository {
  findById(id: string): Promise<AdvantageEntity | null>;
  create(data: CreateAdvantageData): Promise<AdvantageEntity>;
  update(id: string, data: UpdateAdvantageData): Promise<AdvantageEntity>;
  delete(id: string): Promise<void>;
}
