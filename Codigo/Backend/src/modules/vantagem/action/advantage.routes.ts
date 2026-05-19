import type { FastifyInstance } from 'fastify';
import type { CreateAdvantageInput, UpdateAdvantageInput } from '../application/advantage-service.js';
import { requireRole } from '../../../shared/auth/require-role.js';
import { sendErrorResponse } from '../../../shared/responder/error-responder.js';
import { toAdvantageListResponse, toAdvantageResponse, toRedemptionResponse } from '../responder/advantage-responder.js';

const advantageSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    imageUrl: { type: 'string', nullable: true },
    costInCoins: { type: 'integer' },
    isActive: { type: 'boolean' },
    partner: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' } } },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' }
  }
} as const;

const redemptionSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    code: { type: 'string' },
    coinCost: { type: 'integer' },
    advantage: { type: 'object', properties: { id: { type: 'string' }, title: { type: 'string' }, partner: { type: 'string' } } },
    student: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' } } },
    createdAt: { type: 'string' }
  }
} as const;

const bodySchema = {
  type: 'object',
  required: ['title', 'description', 'costInCoins'],
  properties: {
    title: { type: 'string', minLength: 2 },
    description: { type: 'string', minLength: 5 },
    imageUrl: { type: 'string', nullable: true },
    costInCoins: { type: 'integer', minimum: 1 }
  }
} as const;

const errorSchema = { type: 'object', properties: { message: { type: 'string' } } } as const;

export async function advantageRoutes(app: FastifyInstance) {

  // All authenticated — catalog (active advantages only)
  app.get('/api/vantagens', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Vantagens'],
      summary: 'Lista vantagens disponiveis (ativas)',
      response: { 200: { type: 'array', items: advantageSchema } }
    }
  }, async () => {
    const list = await app.advantageService.list();
    return toAdvantageListResponse(list);
  });

  // Admin — all advantages (all statuses, all partners)
  app.get('/api/vantagens/admin', {
    preHandler: [app.authenticate, requireRole('admin')],
    schema: {
      tags: ['Vantagens'],
      summary: 'Lista todas as vantagens (admin)',
      response: { 200: { type: 'array', items: advantageSchema } }
    }
  }, async () => {
    return toAdvantageListResponse(await app.advantageService.listAll());
  });

  // Partner — own advantages (all statuses)
  app.get('/api/vantagens/minhas', {
    preHandler: [app.authenticate, requireRole('partner')],
    schema: {
      tags: ['Vantagens'],
      summary: 'Lista as vantagens da empresa parceira autenticada',
      response: { 200: { type: 'array', items: advantageSchema } }
    }
  }, async (request) => {
    const { sub } = request.user as { sub: string };
    const list = await app.advantageService.listByPartner(sub);
    return toAdvantageListResponse(list);
  });

  // Partner or admin — all redemptions across a partner's advantages
  app.get<{ Querystring: { partnerId?: string } }>('/api/vantagens/resgates', {
    preHandler: [app.authenticate, requireRole('partner', 'admin')],
    schema: {
      tags: ['Vantagens'],
      summary: 'Lista todos os resgates das vantagens da empresa parceira (admin usa ?partnerId=)',
      querystring: { type: 'object', properties: { partnerId: { type: 'string', format: 'uuid' } } },
      response: { 200: { type: 'array', items: redemptionSchema }, 400: { type: 'object', properties: { message: { type: 'string' } } } }
    }
  }, async (request, reply) => {
    const { sub, role } = request.user as { sub: string; role: string };
    const partnerId = role === 'admin' ? request.query.partnerId : sub;
    if (!partnerId) return reply.status(400).send({ message: 'partnerId e obrigatorio para admin' });
    const list = await app.advantageService.listPartnerRedemptions(partnerId);
    return list.map(toRedemptionResponse);
  });

  // Partner or student — redemptions for a specific advantage
  app.get<{ Params: { id: string } }>('/api/vantagens/:id/resgates', {
    preHandler: [app.authenticate, requireRole('partner', 'student')],
    schema: {
      tags: ['Vantagens'],
      summary: 'Lista resgates de uma vantagem (parceiro ve todos; aluno ve os seus)',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
      response: { 200: { type: 'array', items: redemptionSchema }, 403: errorSchema, 404: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const { sub, role } = request.user as { sub: string; role: string };
      const list = await app.advantageService.listRedemptionsByAdvantage(request.params.id, sub, role);
      return list.map(toRedemptionResponse);
    } catch (error) {
      return sendErrorResponse(reply, error);
    }
  });

  app.get<{ Params: { id: string } }>('/api/vantagens/:id', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Vantagens'],
      summary: 'Consulta uma vantagem pelo identificador',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
      response: { 200: advantageSchema, 404: errorSchema }
    }
  }, async (request, reply) => {
    const advantage = await app.advantageService.findById(request.params.id);
    if (!advantage) return reply.status(404).send({ message: 'Vantagem nao encontrada' });
    return toAdvantageResponse(advantage);
  });

  app.post<{ Body: CreateAdvantageInput }>('/api/vantagens', {
    preHandler: [app.authenticate, requireRole('partner')],
    schema: {
      tags: ['Vantagens'],
      summary: 'Cadastra uma vantagem (parceiro)',
      body: bodySchema,
      response: { 201: advantageSchema }
    }
  }, async (request, reply) => {
    const { sub } = request.user as { sub: string };
    const advantage = await app.advantageService.create(sub, request.body);
    return reply.status(201).send(toAdvantageResponse(advantage));
  });

  app.put<{ Params: { id: string }; Body: UpdateAdvantageInput }>('/api/vantagens/:id', {
    preHandler: [app.authenticate, requireRole('partner', 'admin')],
    schema: {
      tags: ['Vantagens'],
      summary: 'Atualiza uma vantagem (parceiro proprietario ou admin)',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
      body: {
        type: 'object',
        minProperties: 1,
        properties: {
          title: { type: 'string', minLength: 2 },
          description: { type: 'string', minLength: 5 },
          imageUrl: { type: 'string', nullable: true },
          costInCoins: { type: 'integer', minimum: 1 },
          isActive: { type: 'boolean' }
        }
      },
      response: { 200: advantageSchema, 403: errorSchema, 404: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const { sub, role } = request.user as { sub: string; role: string };
      const advantage = await app.advantageService.update(request.params.id, sub, role, request.body);
      return toAdvantageResponse(advantage);
    } catch (error) {
      return sendErrorResponse(reply, error);
    }
  });

  app.delete<{ Params: { id: string } }>('/api/vantagens/:id', {
    preHandler: [app.authenticate, requireRole('partner', 'admin')],
    schema: {
      tags: ['Vantagens'],
      summary: 'Remove uma vantagem (parceiro proprietario ou admin)',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
      response: { 204: { type: 'null' }, 403: errorSchema, 404: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const { sub, role } = request.user as { sub: string; role: string };
      await app.advantageService.delete(request.params.id, sub, role);
      return reply.status(204).send();
    } catch (error) {
      return sendErrorResponse(reply, error);
    }
  });

  // Student redeems advantage
  app.post<{ Params: { id: string } }>('/api/vantagens/:id/resgatar', {
    preHandler: [app.authenticate, requireRole('student')],
    schema: {
      tags: ['Vantagens'],
      summary: 'Resgata uma vantagem (aluno) — debita moedas e gera cupom por email',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
      response: { 201: redemptionSchema, 400: errorSchema, 404: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const { sub } = request.user as { sub: string };
      const redemption = await app.advantageService.redeem(request.params.id, sub);
      return reply.status(201).send(toRedemptionResponse(redemption));
    } catch (error) {
      return sendErrorResponse(reply, error);
    }
  });

  // Student — own redemption history; admin — any student by ?studentId
  app.get<{ Querystring: { studentId?: string } }>('/api/resgates', {
    preHandler: [app.authenticate, requireRole('student', 'admin')],
    schema: {
      tags: ['Vantagens'],
      summary: 'Historico de resgates (aluno: proprios; admin: studentId obrigatorio)',
      querystring: {
        type: 'object',
        properties: { studentId: { type: 'string', format: 'uuid' } }
      },
      response: { 200: { type: 'array', items: redemptionSchema }, 400: errorSchema }
    }
  }, async (request, reply) => {
    const { sub, role } = request.user as { sub: string; role: string };
    if (role === 'admin') {
      const { studentId } = request.query;
      if (!studentId) return reply.status(400).send({ message: 'studentId e obrigatorio para admin' });
      const list = await app.advantageService.listRedemptionsByStudent(studentId);
      return list.map(toRedemptionResponse);
    }
    const list = await app.advantageService.listRedemptionsByStudent(sub);
    return list.map(toRedemptionResponse);
  });
}

