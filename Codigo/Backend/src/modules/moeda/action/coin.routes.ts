import type { FastifyInstance } from 'fastify';
import { sendCoinReceivedEmail, sendCoinSentConfirmationEmail } from '../../../shared/email/email-service.js';
import { sendErrorResponse } from '../../../shared/responder/error-responder.js';
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
  const service = createCoinService(app);

  app.post<{ Body: EnviarMoedasInput }>('/api/moedas/enviar', {
    schema: {
      tags: ['Moedas'],
      summary: 'UC05 - Professor envia moedas para aluno',
      body: {
        type: 'object',
        required: ['professorId', 'studentId', 'amount', 'motive'],
        properties: {
          professorId: { type: 'string', format: 'uuid' },
          studentId: { type: 'string', format: 'uuid' },
          amount: { type: 'integer', minimum: 1 },
          motive: { type: 'string', minLength: 1 }
        }
      },
      response: { 201: transactionSchema, 400: errorSchema, 404: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const { transaction, event } = await service.enviarMoedas(request.body);

      // Dispara emails em resposta ao evento — side effect fora do Domain
      void Promise.allSettled([
        sendCoinReceivedEmail({
          studentName: event.studentName,
          studentEmail: event.studentEmail,
          professorName: event.professorName,
          amount: event.amount,
          motive: event.motive
        }),
        sendCoinSentConfirmationEmail({
          professorName: event.professorName,
          professorEmail: event.professorEmail,
          studentName: event.studentName,
          amount: event.amount,
          motive: event.motive
        })
      ]);

      return reply.status(201).send(toTransactionResponse(transaction));
    } catch (error) {
      return sendErrorResponse(reply, error);
    }
  });

  app.get<{ Params: { professorId: string } }>('/api/moedas/extrato/professor/:professorId', {
    schema: {
      tags: ['Moedas'],
      summary: 'UC06 - Extrato do professor (envios realizados + saldo)',
      params: {
        type: 'object',
        required: ['professorId'],
        properties: { professorId: { type: 'string', format: 'uuid' } }
      },
      response: { 200: extratoSchema, 404: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const data = await service.extratoProfessor(request.params.professorId);
      return toExtratoResponse(data);
    } catch (error) {
      return sendErrorResponse(reply, error);
    }
  });

  app.get<{ Params: { studentId: string } }>('/api/moedas/extrato/aluno/:studentId', {
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
