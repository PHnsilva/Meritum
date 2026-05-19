import type { PrismaTx } from '../../../shared/infra/unit-of-work.js';

export type StudentCoinView = {
  id: string;
  coinBalance: number;
  user: { name: string; email: string };
};

export interface StudentCoinPort {
  findById(id: string): Promise<StudentCoinView | null>;
  /** Atomically decrements balance if sufficient. Returns false if balance < amount (no update performed). */
  deductCoins(id: string, amount: number, tx: PrismaTx): Promise<boolean>;
}
