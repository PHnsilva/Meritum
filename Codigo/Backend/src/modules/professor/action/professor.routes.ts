import type { FastifyInstance } from 'fastify';
import type { CreateProfessorInput, UpdateProfessorInput } from '../application/professor-service.js';
import { sendErrorResponse } from '../../../shared/responder/error-responder.js';
import { requireRole } from '../../../shared/auth/require-role.js';
import { toProfessorListResponse, toProfessorResponse } from '../responder/professor-responder.js';

const professorResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    cpf: { type: 'string' },
    department: { type: 'string' },
    coinBalance: { type: 'integer' },
    institution: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' }
      }
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
} as const;

const professorBodySchema = {
  type: 'object',
  required: ['name', 'email', 'cpf', 'department', 'institutionId'],
  properties: {
    name: { type: 'string', minLength: 2 },
    email: { type: 'string', format: 'email' },
    cpf: { type: 'string', minLength: 11 },
    department: { type: 'string', minLength: 2 },
    institutionId: { type: 'string', format: 'uuid' }
  }
} as const;

const updateProfessorBodySchema = {
  type: 'object',
  minProperties: 1,
  properties: professorBodySchema.properties
} as const;

const errorSchema = { type: 'object', properties: { message: { type: 'string' } } } as const;

const paginatedProfessorSchema = {
  type: 'object',
  properties: {
    data: { type: 'array', items: professorResponseSchema },
    total: { type: 'integer' },
    page: { type: 'integer' },
    limit: { type: 'integer' },
    totalPages: { type: 'integer' }
  }
} as const;

export async function professorRoutes(app: FastifyInstance) {

  app.get<{ Querystring: { page?: number; limit?: number; institutionId?: string } }>('/api/professores', {
    preHandler: [app.authenticate, requireRole('admin', 'institution')],
    schema: {
      tags: ['Professores'],
      summary: 'Lista professores cadastrados (paginado)',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 200, default: 50 },
          institutionId: { type: 'string', format: 'uuid' }
        }
      },
      response: { 200: paginatedProfessorSchema }
    }
  }, async (request) => {
    const { page = 1, limit = 50, institutionId } = request.query;
    const result = await app.professorService.list(page, limit, institutionId);
    return { ...result, data: toProfessorListResponse(result.data) };
  });

  app.get<{ Params: { id: string } }>('/api/professores/:id', {
    preHandler: [app.authenticate, requireRole('admin', 'professor')],
    schema: {
      tags: ['Professores'],
      summary: 'Consulta professor pelo identificador',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      response: { 200: professorResponseSchema, 404: errorSchema }
    }
  }, async (request, reply) => {
    const professor = await app.professorService.findById(request.params.id);
    if (!professor) return reply.status(404).send({ message: 'Professor nao encontrado' });
    return toProfessorResponse(professor);
  });

  app.post<{ Body: CreateProfessorInput }>('/api/professores', {
    preHandler: [app.authenticate, requireRole('admin')],
    schema: {
      tags: ['Professores'],
      summary: 'Cadastra um professor',
      body: professorBodySchema,
      response: { 201: professorResponseSchema, 404: errorSchema, 409: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const professor = await app.professorService.create(request.body);
      return reply.status(201).send(toProfessorResponse(professor));
    } catch (error) {
      return sendErrorResponse(reply, error, 'Professor ja cadastrado com email ou CPF informado');
    }
  });

  app.put<{ Params: { id: string }; Body: UpdateProfessorInput }>('/api/professores/:id', {
    preHandler: [app.authenticate, requireRole('admin', 'professor')],
    schema: {
      tags: ['Professores'],
      summary: 'Atualiza um professor',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      body: updateProfessorBodySchema,
      response: { 200: professorResponseSchema, 404: errorSchema, 409: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const professor = await app.professorService.update(request.params.id, request.body);
      if (!professor) return reply.status(404).send({ message: 'Professor nao encontrado' });
      return toProfessorResponse(professor);
    } catch (error) {
      return sendErrorResponse(reply, error, 'Professor ja cadastrado com email ou CPF informado');
    }
  });

  app.delete<{ Params: { id: string } }>('/api/professores/:id', {
    preHandler: [app.authenticate, requireRole('admin')],
    schema: {
      tags: ['Professores'],
      summary: 'Remove um professor',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      response: { 204: { type: 'null' }, 404: errorSchema }
    }
  }, async (request, reply) => {
    const professor = await app.professorService.delete(request.params.id);
    if (!professor) return reply.status(404).send({ message: 'Professor nao encontrado' });
    return reply.status(204).send();
  });
}

