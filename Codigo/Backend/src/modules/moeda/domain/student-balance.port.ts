import type { PrismaTx } from '../../../shared/infra/unit-of-work.js';

export type StudentBalanceView = {
  id: string;
  institutionId: string;
  coinBalance: number;
  user: { name: string; email: string };
};

export interface StudentBalancePort {
  findById(id: string): Promise<StudentBalanceView | null>;
  /** Atomically increments student balance. */
  addBalance(id: string, amount: number, tx: PrismaTx): Promise<void>;
}
