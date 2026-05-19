import type { PrismaTx } from '../../../shared/infra/unit-of-work.js';

export type ProfessorBalanceView = {
  id: string;
  institutionId: string;
  coinBalance: number;
  user: { name: string; email: string };
};

export interface ProfessorBalancePort {
  findById(id: string): Promise<ProfessorBalanceView | null>;
  /** Atomically decrements balance if sufficient. Returns false if balance < amount (no update performed). */
  deductBalance(id: string, amount: number, tx: PrismaTx): Promise<boolean>;
}
