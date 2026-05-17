import type { FastifyInstance } from 'fastify';
import { sendCoinReceivedEmail, sendCoinSentConfirmationEmail } from '../../../shared/email/email-service.js';

export type EnviarMoedasInput = {
  professorId: string;
  studentId: string;
  amount: number;
  motive: string;
};

export function createCoinService(app: FastifyInstance) {
  return {
    async enviarMoedas(input: EnviarMoedasInput) {
      const professor = await app.prisma.professor.findUnique({
        where: { id: input.professorId },
        include: { user: true }
      });
      if (!professor) {
        const err = new Error('Professor nao encontrado');
        err.name = 'ProfessorNotFoundError';
        throw err;
      }

      if (professor.coinBalance < input.amount) {
        const err = new Error('Saldo insuficiente para realizar o envio');
        err.name = 'InsufficientBalanceError';
        throw err;
      }

      const student = await app.prisma.student.findUnique({
        where: { id: input.studentId },
        include: { user: true }
      });
      if (!student) {
        const err = new Error('Aluno nao encontrado');
        err.name = 'StudentNotFoundError';
        throw err;
      }

      const transaction = await app.prisma.$transaction(async (tx) => {
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

      await Promise.allSettled([
        sendCoinReceivedEmail({
          studentName: student.user.name,
          studentEmail: student.user.email,
          professorName: professor.user.name,
          amount: input.amount,
          motive: input.motive
        }),
        sendCoinSentConfirmationEmail({
          professorName: professor.user.name,
          professorEmail: professor.user.email,
          studentName: student.user.name,
          amount: input.amount,
          motive: input.motive
        })
      ]);

      return transaction;
    },

    async extratoProfessor(professorId: string) {
      const professor = await app.prisma.professor.findUnique({
        where: { id: professorId },
        include: { user: true }
      });
      if (!professor) {
        const err = new Error('Professor nao encontrado');
        err.name = 'ProfessorNotFoundError';
        throw err;
      }

      const transactions = await app.prisma.transaction.findMany({
        where: { professorId },
        include: { student: { include: { user: true } } },
        orderBy: { createdAt: 'desc' }
      });

      return { coinBalance: professor.coinBalance, transactions };
    },

    async extratoAluno(studentId: string) {
      const student = await app.prisma.student.findUnique({
        where: { id: studentId },
        include: { user: true }
      });
      if (!student) {
        const err = new Error('Aluno nao encontrado');
        err.name = 'StudentNotFoundError';
        throw err;
      }

      const transactions = await app.prisma.transaction.findMany({
        where: { studentId },
        include: { professor: { include: { user: true } } },
        orderBy: { createdAt: 'desc' }
      });

      return { coinBalance: student.coinBalance, transactions };
    }
  };
}
