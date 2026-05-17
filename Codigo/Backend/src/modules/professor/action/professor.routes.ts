import type { FastifyInstance } from 'fastify';
import { createProfessorService, type CreateProfessorInput, type UpdateProfessorInput } from '../application/professor-service.js';
import { toProfessorListResponse, toProfessorResponse } from '../responder/professor-responder.js';
import { isUniqueConstraintError } from '../../../shared/prisma/prisma-errors.js';

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
  required: ['name', 'email', 'cpf', 'department', 'institutionId', 'password'],
  properties: {
    name: { type: 'string', minLength: 2 },
    email: { type: 'string', format: 'email' },
    cpf: { type: 'string', minLength: 11 },
    department: { type: 'string', minLength: 2 },
    institutionId: { type: 'string', format: 'uuid' },
    password: { type: 'string', minLength: 6 }
  }
} as const;

const updateProfessorBodySchema = {
  type: 'object',
  minProperties: 1,
  properties: professorBodySchema.properties
} as const;

const notFoundSchema = { type: 'object', properties: { message: { type: 'string' } } } as const;
const conflictSchema = { type: 'object', properties: { message: { type: 'string' } } } as const;

export async function professorRoutes(app: FastifyInstance) {
  const service = createProfessorService(app);

  app.get('/api/professores', {
    schema: {
      tags: ['Professores'],
      summary: 'Lista professores cadastrados',
      response: { 200: { type: 'array', items: professorResponseSchema } }
    }
  }, async () => {
    const professors = await service.list();
    return toProfessorListResponse(professors);
  });

  app.get<{ Params: { id: string } }>('/api/professores/:id', {
    schema: {
      tags: ['Professores'],
      summary: 'Consulta professor pelo identificador',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      response: { 200: professorResponseSchema, 404: notFoundSchema }
    }
  }, async (request, reply) => {
    const professor = await service.findById(request.params.id);
    if (!professor) return reply.status(404).send({ message: 'Professor nao encontrado' });
    return toProfessorResponse(professor);
  });

  app.post<{ Body: CreateProfessorInput }>('/api/professores', {
    schema: {
      tags: ['Professores'],
      summary: 'Cadastra um professor',
      body: professorBodySchema,
      response: { 201: professorResponseSchema, 404: notFoundSchema, 409: conflictSchema }
    }
  }, async (request, reply) => {
    try {
      const professor = await service.create(request.body);
      return reply.status(201).send(toProfessorResponse(professor));
    } catch (error) {
      if (error instanceof Error && error.name === 'InstitutionNotFoundError') {
        return reply.status(404).send({ message: error.message });
      }
      if (isUniqueConstraintError(error)) {
        return reply.status(409).send({ message: 'Professor ja cadastrado com email ou CPF informado' });
      }
      throw error;
    }
  });

  app.put<{ Params: { id: string }; Body: UpdateProfessorInput }>('/api/professores/:id', {
    schema: {
      tags: ['Professores'],
      summary: 'Atualiza um professor',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      body: updateProfessorBodySchema,
      response: { 200: professorResponseSchema, 404: notFoundSchema, 409: conflictSchema }
    }
  }, async (request, reply) => {
    try {
      const professor = await service.update(request.params.id, request.body);
      if (!professor) return reply.status(404).send({ message: 'Professor nao encontrado' });
      return toProfessorResponse(professor);
    } catch (error) {
      if (error instanceof Error && error.name === 'InstitutionNotFoundError') {
        return reply.status(404).send({ message: error.message });
      }
      if (isUniqueConstraintError(error)) {
        return reply.status(409).send({ message: 'Professor ja cadastrado com email ou CPF informado' });
      }
      throw error;
    }
  });

  app.delete<{ Params: { id: string } }>('/api/professores/:id', {
    schema: {
      tags: ['Professores'],
      summary: 'Remove um professor',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      response: { 204: { type: 'null' }, 404: notFoundSchema }
    }
  }, async (request, reply) => {
    const professor = await service.delete(request.params.id);
    if (!professor) return reply.status(404).send({ message: 'Professor nao encontrado' });
    return reply.status(204).send();
  });
}
