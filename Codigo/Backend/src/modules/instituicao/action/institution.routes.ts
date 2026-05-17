import type { FastifyInstance } from 'fastify';
import { sendErrorResponse } from '../../../shared/responder/error-responder.js';
import { requireRole } from '../../../shared/auth/require-role.js';
import { createInstitutionService, type CreateInstitutionInput, type UpdateInstitutionInput } from '../application/institution-service.js';
import { toInstitutionListResponse, toInstitutionResponse } from '../responder/institution-responder.js';

const institutionResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
} as const;

const institutionBodySchema = {
  type: 'object',
  required: ['name'],
  properties: { name: { type: 'string', minLength: 2 } }
} as const;

const updateInstitutionBodySchema = {
  type: 'object',
  minProperties: 1,
  properties: institutionBodySchema.properties
} as const;

const errorSchema = { type: 'object', properties: { message: { type: 'string' } } } as const;

export async function institutionRoutes(app: FastifyInstance) {
  const institutionService = createInstitutionService(app);

  app.get('/api/instituicoes', {
    preHandler: [app.authenticate, requireRole('admin', 'professor', 'student', 'partner')],
    schema: {
      tags: ['Instituicoes'],
      summary: 'Lista instituicoes de ensino (usada em selects)',
      response: { 200: { type: 'array', items: institutionResponseSchema } }
    }
  }, async () => {
    return toInstitutionListResponse(await institutionService.list());
  });

  app.get<{ Params: { id: string } }>('/api/instituicoes/:id', {
    preHandler: [app.authenticate, requireRole('admin', 'professor')],
    schema: {
      tags: ['Instituicoes'],
      summary: 'Consulta uma instituicao pelo identificador',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      response: { 200: institutionResponseSchema, 404: errorSchema }
    }
  }, async (request, reply) => {
    const institution = await institutionService.findById(request.params.id);
    if (!institution) return reply.status(404).send({ message: 'Instituicao nao encontrada' });
    return toInstitutionResponse(institution);
  });

  app.post<{ Body: CreateInstitutionInput }>('/api/instituicoes', {
    preHandler: [app.authenticate, requireRole('admin')],
    schema: {
      tags: ['Instituicoes'],
      summary: 'Cadastra uma instituicao de ensino',
      body: institutionBodySchema,
      response: { 201: institutionResponseSchema, 409: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const institution = await institutionService.create(request.body);
      return reply.status(201).send(toInstitutionResponse(institution));
    } catch (error) {
      return sendErrorResponse(reply, error, 'Instituicao ja cadastrada com o nome informado');
    }
  });

  app.put<{ Params: { id: string }; Body: UpdateInstitutionInput }>('/api/instituicoes/:id', {
    preHandler: [app.authenticate, requireRole('admin')],
    schema: {
      tags: ['Instituicoes'],
      summary: 'Atualiza uma instituicao de ensino',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      body: updateInstitutionBodySchema,
      response: { 200: institutionResponseSchema, 404: errorSchema, 409: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const institution = await institutionService.update(request.params.id, request.body);
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
      const institution = await institutionService.delete(request.params.id);
      if (!institution) return reply.status(404).send({ message: 'Instituicao nao encontrada' });
      return reply.status(204).send();
    } catch (error) {
      return sendErrorResponse(reply, error, 'Nao e possivel remover uma instituicao vinculada a alunos ou professores');
    }
  });
}
