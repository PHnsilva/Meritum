import type { FastifyInstance } from 'fastify';
import { sendErrorResponse } from '../../../shared/responder/error-responder.js';
import { requireRole } from '../../../shared/auth/require-role.js';
import { createUnitOfWork } from '../../../shared/infra/unit-of-work.js';
import { PrismaProfessorBalanceRepository } from '../infra/prisma-professor-balance.repository.js';
import { PrismaStudentBalanceRepository } from '../infra/prisma-student-balance.repository.js';
import { PrismaTransactionRepository } from '../infra/prisma-transaction.repository.js';
import { createCoinService, type EnviarMoedasInput } from '../application/coin-service.js';
import { toExtratoResponse, toTransactionResponse } from '../responder/coin-responder.js';

const transactionSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    amount: { type: 'integer' },
    motive: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    professor: {
      type: 'object',
      nullable: true,
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
        department: { type: 'string' }
      }
    },
    student: {
      type: 'object',
      nullable: true,
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
        course: { type: 'string' }
      }
    }
  }
} as const;

const extratoSchema = {
  type: 'object',
  properties: {
    coinBalance: { type: 'integer' },
    transactions: { type: 'array', items: transactionSchema }
  }
} as const;

const errorSchema = { type: 'object', properties: { message: { type: 'string' } } } as const;

export async function coinRoutes(app: FastifyInstance) {
  const service = createCoinService(
    new PrismaProfessorBalanceRepository(app.prisma),
    new PrismaStudentBalanceRepository(app.prisma),
    new PrismaTransactionRepository(app.prisma),
    createUnitOfWork(app.prisma)
  );

  app.post<{ Body: Omit<EnviarMoedasInput, 'professorId'> }>('/api/moedas/enviar', {
    preHandler: [app.authenticate, requireRole('professor')],
    schema: {
      tags: ['Moedas'],
      summary: 'UC05 - Professor envia moedas para aluno',
      body: {
        type: 'object',
        required: ['studentId', 'amount', 'motive'],
        properties: {
          studentId: { type: 'string', format: 'uuid' },
          amount: { type: 'integer', minimum: 1 },
          motive: { type: 'string', minLength: 1 }
        }
      },
      response: { 201: transactionSchema, 400: errorSchema, 404: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const { sub } = request.user as { sub: string };
      const transaction = await service.enviarMoedas({ ...request.body, professorId: sub });
      return reply.status(201).send(toTransactionResponse(transaction));
    } catch (error) {
      return sendErrorResponse(reply, error);
    }
  });

  app.get<{ Params: { professorId: string } }>('/api/moedas/extrato/professor/:professorId', {
    preHandler: [app.authenticate, requireRole('admin', 'professor')],
    schema: {
      tags: ['Moedas'],
      summary: 'UC06 - Extrato do professor (envios realizados + saldo)',
      params: {
        type: 'object',
        required: ['professorId'],
        properties: { professorId: { type: 'string', format: 'uuid' } }
      },
      response: { 200: extratoSchema, 403: errorSchema, 404: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const { sub, role } = request.user as { sub: string; role: string };
      if (role === 'professor' && sub !== request.params.professorId) {
        return reply.status(403).send({ message: 'Acesso negado: voce so pode ver seu proprio extrato' });
      }
      const data = await service.extratoProfessor(request.params.professorId);
      return toExtratoResponse(data);
    } catch (error) {
      return sendErrorResponse(reply, error);
    }
  });

  app.get<{ Params: { studentId: string } }>('/api/moedas/extrato/aluno/:studentId', {
    preHandler: [app.authenticate, requireRole('admin', 'student')],
    schema: {
      tags: ['Moedas'],
      summary: 'UC06 - Extrato do aluno (recebimentos + saldo)',
      params: {
        type: 'object',
        required: ['studentId'],
        properties: { studentId: { type: 'string', format: 'uuid' } }
      },
      response: { 200: extratoSchema, 404: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const data = await service.extratoAluno(request.params.studentId);
      return toExtratoResponse(data);
    } catch (error) {
      return sendErrorResponse(reply, error);
    }
  });
}
