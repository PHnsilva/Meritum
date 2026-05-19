import type { PrismaTx } from '../../../shared/infra/unit-of-work.js';

export type TransactionData = {
  professorId: string;
  studentId: string;
  amount: number;
  motive: string;
};

type TransactionBase = { id: string; amount: number; motive: string; createdAt: Date };
type ProfessorRef = { id: string; department: string; user: { name: string; email: string } };
type StudentRef  = { id: string; course: string;      user: { name: string; email: string } };

/** Read models usados apenas para extrato — não são entidades de domínio. */
export type TransactionFull         = TransactionBase & { professor?: ProfessorRef | null; student?: StudentRef | null };
export type TransactionWithStudent  = TransactionBase & { student?: StudentRef | null };
export type TransactionWithProfessor = TransactionBase & { professor?: ProfessorRef | null };

export interface TransactionRepository {
  create(data: TransactionData, tx: PrismaTx): Promise<TransactionFull>;
  findByProfessorId(professorId: string): Promise<TransactionWithStudent[]>;
  findByStudentId(studentId: string): Promise<TransactionWithProfessor[]>;
}
