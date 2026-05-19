import { MoedasEnviadasEvent } from '../../../shared/domain/events/moedas-enviadas-event.js';
import { eventBus } from '../../../shared/domain/events/event-bus.js';
import { DomainErrors } from '../../../shared/errors/domain-errors.js';
import { CoinBalance } from '../../../shared/domain/value-objects/coin-balance.js';
import type { UnitOfWork } from '../../../shared/infra/unit-of-work.js';
import type { ProfessorBalancePort } from '../domain/professor-balance.port.js';
import type { StudentBalancePort } from '../domain/student-balance.port.js';
import type { TransactionRepository } from '../domain/transaction.repository.js';

export type EnviarMoedasInput = {
  professorId: string;
  studentId: string;
  amount: number;
  motive: string;
};

export function createCoinService(
  professorPort: ProfessorBalancePort,
  studentPort: StudentBalancePort,
  transactionRepo: TransactionRepository,
  uow: UnitOfWork
) {
  return {
    async enviarMoedas(input: EnviarMoedasInput) {
      const professor = await professorPort.findById(input.professorId);
      if (!professor) throw DomainErrors.professorNotFound();

      const student = await studentPort.findById(input.studentId);
      if (!student) throw DomainErrors.studentNotFound();

      if (professor.institutionId !== student.institutionId) throw DomainErrors.differentInstitution();

      // Eager domain check gives a clear error message for the obvious case.
      // The real concurrency guard is the conditional atomic decrement inside the TX below.
      CoinBalance.create(professor.coinBalance).deduct(input.amount);

      const transaction = await uow.run(async (tx) => {
        // Atomic conditional decrement: only succeeds if balance >= amount at commit time.
        const deducted = await professorPort.deductBalance(professor.id, input.amount, tx);
        if (!deducted) throw DomainErrors.insufficientBalance();

        await studentPort.addBalance(student.id, input.amount, tx);

        return transactionRepo.create(
          { professorId: professor.id, studentId: student.id, amount: input.amount, motive: input.motive },
          tx
        );
      });

      eventBus.publish(new MoedasEnviadasEvent(
        professor.id,
        professor.user.name,
        professor.user.email,
        student.id,
        student.user.name,
        student.user.email,
        input.amount,
        input.motive
      ));

      return transaction;
    },

    async extratoProfessor(professorId: string) {
      const professor = await professorPort.findById(professorId);
      if (!professor) throw DomainErrors.professorNotFound();

      const transactions = await transactionRepo.findByProfessorId(professorId);
      return { coinBalance: professor.coinBalance, transactions };
    },

    async extratoAluno(studentId: string) {
      const student = await studentPort.findById(studentId);
      if (!student) throw DomainErrors.studentNotFound();

      const transactions = await transactionRepo.findByStudentId(studentId);
      return { coinBalance: student.coinBalance, transactions };
    }
  };
}
