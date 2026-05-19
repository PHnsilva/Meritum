import type { FastifyInstance } from 'fastify';
import type { CreateInstitutionInput, RegisterInstitutionInput, UpdateInstitutionInput } from '../application/institution-service.js';
import { sendErrorResponse } from '../../../shared/responder/error-responder.js';
import { requireRole } from '../../../shared/auth/require-role.js';

import { toInstitutionListResponse, toInstitutionResponse } from '../responder/institution-responder.js';

const institutionResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    status: { type: 'string', enum: ['pending', 'approved'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    userEmail: { type: 'string' }
  }
} as const;

const errorSchema = { type: 'object', properties: { message: { type: 'string' } } } as const;
const messageSchema = { type: 'object', properties: { message: { type: 'string' } } } as const;

const paginatedInstitutionSchema = {
  type: 'object',
  properties: {
    data: { type: 'array', items: institutionResponseSchema },
    total: { type: 'integer' },
    page: { type: 'integer' },
    limit: { type: 'integer' },
    totalPages: { type: 'integer' }
  }
} as const;

export async function institutionRoutes(app: FastifyInstance) {

  // Public — student/professor self-registration select + institution self-registration
  app.get('/api/instituicoes', {
    schema: {
      tags: ['Instituicoes'],
      summary: 'Lista instituicoes aprovadas (publica — usada em selects de cadastro)',
      response: { 200: { type: 'array', items: institutionResponseSchema } }
    }
  }, async () => {
    return toInstitutionListResponse(await app.institutionService.list('APPROVED'));
  });

  // Admin — all institutions with optional status filter
  app.get<{ Querystring: { status?: 'PENDING' | 'APPROVED' } }>('/api/instituicoes/admin', {
    preHandler: [app.authenticate, requireRole('admin')],
    schema: {
      tags: ['Instituicoes'],
      summary: 'Lista todas as instituicoes (admin) com filtro opcional de status',
      querystring: {
        type: 'object',
        properties: { status: { type: 'string', enum: ['PENDING', 'APPROVED'] } }
      },
      response: { 200: { type: 'array', items: institutionResponseSchema } }
    }
  }, async (request) => {
    return toInstitutionListResponse(await app.institutionService.list(request.query.status));
  });

  // Public — institution self-registration (status = PENDING, sends email)
  app.post<{ Body: RegisterInstitutionInput }>('/api/instituicoes/solicitar', {
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
    schema: {
      tags: ['Instituicoes'],
      summary: 'Solicita cadastro de instituicao (aguarda aprovacao admin)',
      body: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 2 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      },
      response: { 201: institutionResponseSchema, 409: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const institution = await app.institutionService.register(request.body);
      return reply.status(201).send(toInstitutionResponse(institution));
    } catch (error) {
      return sendErrorResponse(reply, error, 'Instituicao ja cadastrada com o nome ou email informado');
    }
  });

  // Admin — approve pending institution (sends approval email)
  app.post<{ Params: { id: string } }>('/api/instituicoes/:id/aprovar', {
    preHandler: [app.authenticate, requireRole('admin')],
    schema: {
      tags: ['Instituicoes'],
      summary: 'Aprova o cadastro de uma instituicao e envia email de confirmacao',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      response: { 200: institutionResponseSchema, 404: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const institution = await app.institutionService.approve(request.params.id);
      return toInstitutionResponse(institution);
    } catch (error) {
      return sendErrorResponse(reply, error, 'Instituicao nao encontrada');
    }
  });

  // Institution — all coin transactions and redemptions from its students
  app.get('/api/instituicoes/minha/transacoes', {
    preHandler: [app.authenticate, requireRole('institution')],
    schema: {
      tags: ['Instituicoes'],
      summary: 'Historico de envios de moedas e resgates dos alunos da instituicao',
      response: {
        200: {
          type: 'object',
          properties: {
            transactions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  amount: { type: 'integer' },
                  motive: { type: 'string' },
                  createdAt: { type: 'string' },
                  professor: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, department: { type: 'string' } } },
                  student: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, course: { type: 'string' } } }
                }
              }
            },
            redemptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  code: { type: 'string' },
                  coinCost: { type: 'integer' },
                  createdAt: { type: 'string' },
                  student: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' } } },
                  advantage: { type: 'object', properties: { title: { type: 'string' }, partner: { type: 'object', properties: { name: { type: 'string' } } } } }
                }
              }
            }
          }
        }
      }
    }
  }, async (request) => {
    const { sub } = request.user as { sub: string };
    return app.institutionService.getTransactions(sub);
  });

  // Institution user — view own institution data
  app.get('/api/instituicoes/minha', {
    preHandler: [app.authenticate, requireRole('institution')],
    schema: {
      tags: ['Instituicoes'],
      summary: 'Consulta dados da propria instituicao (usuario institucional)',
      response: { 200: institutionResponseSchema, 404: errorSchema }
    }
  }, async (request, reply) => {
    const { sub } = request.user as { sub: string };
    const institution = await app.institutionService.findById(sub);
    if (!institution) return reply.status(404).send({ message: 'Instituicao nao encontrada' });
    return toInstitutionResponse(institution);
  });

  // Institution user — update own user profile (name/email)
  app.put('/api/instituicoes/perfil', {
    preHandler: [app.authenticate, requireRole('institution')],
    schema: {
      tags: ['Instituicoes'],
      summary: 'Atualiza perfil do usuario institucional (nome/email)',
      body: {
        type: 'object',
        minProperties: 1,
        properties: {
          name: { type: 'string', minLength: 1 },
          email: { type: 'string', format: 'email' }
        }
      },
      response: { 200: messageSchema, 404: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const { sub } = request.user as { sub: string };
      await app.institutionService.updatePerfil(sub, request.body as { name?: string; email?: string });
      return { message: 'Perfil atualizado com sucesso' };
    } catch (error) {
      return sendErrorResponse(reply, error);
    }
  });

  // Admin — transactions for a specific institution
  app.get<{ Params: { id: string } }>('/api/instituicoes/:id/transacoes', {
    preHandler: [app.authenticate, requireRole('admin')],
    schema: {
      tags: ['Instituicoes'],
      summary: 'Historico de envios e resgates dos alunos de uma instituicao (admin)',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } }
    }
  }, async (request) => {
    return app.institutionService.getTransactions(request.params.id);
  });

  app.get<{ Params: { id: string } }>('/api/instituicoes/:id', {
    preHandler: [app.authenticate, requireRole('admin', 'professor', 'institution')],
    schema: {
      tags: ['Instituicoes'],
      summary: 'Consulta uma instituicao pelo identificador',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      response: { 200: institutionResponseSchema, 404: errorSchema }
    }
  }, async (request, reply) => {
    const institution = await app.institutionService.findById(request.params.id);
    if (!institution) return reply.status(404).send({ message: 'Instituicao nao encontrada' });
    return toInstitutionResponse(institution);
  });

  app.post<{ Body: CreateInstitutionInput }>('/api/instituicoes', {
    preHandler: [app.authenticate, requireRole('admin')],
    schema: {
      tags: ['Instituicoes'],
      summary: 'Cadastra uma instituicao de ensino diretamente (admin — aprovada automaticamente)',
      body: {
        type: 'object',
        required: ['name'],
        properties: { name: { type: 'string', minLength: 2 } }
      },
      response: { 201: institutionResponseSchema, 409: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const institution = await app.institutionService.create(request.body);
      return reply.status(201).send(toInstitutionResponse(institution));
    } catch (error) {
      return sendErrorResponse(reply, error, 'Instituicao ja cadastrada com o nome informado');
    }
  });

  app.put<{ Params: { id: string }; Body: UpdateInstitutionInput & { email?: string; password?: string } }>('/api/instituicoes/:id', {
    preHandler: [app.authenticate, requireRole('admin')],
    schema: {
      tags: ['Instituicoes'],
      summary: 'Atualiza uma instituicao de ensino',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      body: {
        type: 'object',
        minProperties: 1,
        properties: {
          name: { type: 'string', minLength: 2 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      },
      response: { 200: institutionResponseSchema, 404: errorSchema, 409: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const institution = await app.institutionService.update(request.params.id, request.body);
      if (!institution) return reply.status(404).send({ message: 'Instituicao nao encontrada' });
      return toInstitutionResponse(institution);
    } catch (error) {
      return sendErrorResponse(reply, error, 'Instituicao ja cadastrada com o nome informado');
    }
  });

  app.delete<{ Params: { id: string } }>('/api/instituicoes/:id', {
    preHandler: [app.authenticate, requireRole('admin')],
    schema: {
      tags: ['Instituicoes'],
      summary: 'Remove uma instituicao de ensino',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      response: { 204: { type: 'null' }, 404: errorSchema, 409: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const institution = await app.institutionService.delete(request.params.id);
      if (!institution) return reply.status(404).send({ message: 'Instituicao nao encontrada' });
      return reply.status(204).send();
    } catch (error) {
      return sendErrorResponse(reply, error, 'Nao e possivel remover uma instituicao vinculada a alunos ou professores');
    }
  });
}
