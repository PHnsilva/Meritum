import type { PrismaClient } from '@prisma/client';
import { MoedasEnviadasEvent } from '../../../shared/domain/events/moedas-enviadas-event.js';
import { eventBus } from '../../../shared/domain/events/event-bus.js';
import { DomainErrors } from '../../../shared/errors/domain-errors.js';
import { CoinBalance } from '../../../shared/domain/value-objects/coin-balance.js';
import { createProfessorService } from '../../professor/application/professor-service.js';
import { createStudentService } from '../../aluno/application/student-service.js';

export type EnviarMoedasInput = {
  professorId: string;
  studentId: string;
  amount: number;
  motive: string;
};

export function createCoinService(prisma: PrismaClient) {
  const professorService = createProfessorService(prisma);
  const studentService = createStudentService(prisma);

  return {
    async enviarMoedas(input: EnviarMoedasInput) {
      const professor = await professorService.findById(input.professorId);
      if (!professor) throw DomainErrors.professorNotFound();

      const balance = CoinBalance.create(professor.coinBalance);
      balance.deduct(input.amount);

      const student = await studentService.findById(input.studentId);
      if (!student) throw DomainErrors.studentNotFound();

      if (professor.institutionId !== student.institutionId) {
        throw DomainErrors.differentInstitution();
      }

      const transaction = await prisma.$transaction(async (tx) => {
        await tx.professor.update({
          where: { id: input.professorId },
          data: { coinBalance: { decrement: input.amount } }
        });
        await tx.student.update({
          where: { id: input.studentId },
          data: { coinBalance: { increment: input.amount } }
        });
        return tx.transaction.create({
          data: {
            amount: input.amount,
            motive: input.motive,
            professorId: input.professorId,
            studentId: input.studentId
          },
          include: {
            professor: { include: { user: true } },
            student: { include: { user: true } }
          }
        });
      });

      eventBus.publish(new MoedasEnviadasEvent(
        input.professorId,
        professor.user.name,
        professor.user.email,
        input.studentId,
        student.user.name,
        student.user.email,
        input.amount,
        input.motive
      ));

      return transaction;
    },

    async extratoProfessor(professorId: string) {
      const professor = await professorService.findById(professorId);
      if (!professor) throw DomainErrors.professorNotFound();

      const transactions = await prisma.transaction.findMany({
        where: { professorId },
        include: { student: { include: { user: true } } },
        orderBy: { createdAt: 'desc' }
      });

      return { coinBalance: professor.coinBalance, transactions };
    },

    async extratoAluno(studentId: string) {
      const student = await studentService.findById(studentId);
      if (!student) throw DomainErrors.studentNotFound();

      const transactions = await prisma.transaction.findMany({
        where: { studentId },
        include: { professor: { include: { user: true } } },
        orderBy: { createdAt: 'desc' }
      });

      return { coinBalance: student.coinBalance, transactions };
    }
  };
}
