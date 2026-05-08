import type { FastifyInstance } from 'fastify';
import { isForeignKeyConstraintError, isUniqueConstraintError } from '../../../shared/prisma/prisma-errors.js';
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
  properties: {
    name: { type: 'string', minLength: 2 }
  }
} as const;

const updateInstitutionBodySchema = {
  type: 'object',
  minProperties: 1,
  properties: institutionBodySchema.properties
} as const;

const messageResponseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' }
  }
} as const;

export async function institutionRoutes(app: FastifyInstance) {
  const institutionService = createInstitutionService(app);

  app.get('/api/instituicoes', {
    schema: {
      tags: ['Instituicoes'],
      summary: 'Lista instituicoes de ensino cadastradas',
      response: {
        200: {
          type: 'array',
          items: institutionResponseSchema
        }
      }
    }
  }, async () => {
    const institutions = await institutionService.list();
    return toInstitutionListResponse(institutions);
  });

  app.get<{ Params: { id: string } }>('/api/instituicoes/:id', {
    schema: {
      tags: ['Instituicoes'],
      summary: 'Consulta uma instituicao pelo identificador',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } }
      },
      response: {
        200: institutionResponseSchema,
        404: messageResponseSchema
      }
    }
  }, async (request, reply) => {
    const institution = await institutionService.findById(request.params.id);

    if (!institution) {
      return reply.status(404).send({ message: 'Instituicao nao encontrada' });
    }

    return toInstitutionResponse(institution);
  });

  app.post<{ Body: CreateInstitutionInput }>('/api/instituicoes', {
    schema: {
      tags: ['Instituicoes'],
      summary: 'Cadastra uma instituicao de ensino',
      body: institutionBodySchema,
      response: {
        201: institutionResponseSchema,
        409: messageResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const institution = await institutionService.create(request.body);
      return reply.status(201).send(toInstitutionResponse(institution));
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        return reply.status(409).send({ message: 'Instituicao ja cadastrada com o nome informado' });
      }

      throw error;
    }
  });

  app.put<{ Params: { id: string }; Body: UpdateInstitutionInput }>('/api/instituicoes/:id', {
    schema: {
      tags: ['Instituicoes'],
      summary: 'Atualiza uma instituicao de ensino',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } }
      },
      body: updateInstitutionBodySchema,
      response: {
        200: institutionResponseSchema,
        404: messageResponseSchema,
        409: messageResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const institution = await institutionService.update(request.params.id, request.body);

      if (!institution) {
        return reply.status(404).send({ message: 'Instituicao nao encontrada' });
      }

      return toInstitutionResponse(institution);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        return reply.status(409).send({ message: 'Instituicao ja cadastrada com o nome informado' });
      }

      throw error;
    }
  });

  app.delete<{ Params: { id: string } }>('/api/instituicoes/:id', {
    schema: {
      tags: ['Instituicoes'],
      summary: 'Remove uma instituicao de ensino',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } }
      },
      response: {
        204: { type: 'null' },
        404: messageResponseSchema,
        409: messageResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const institution = await institutionService.delete(request.params.id);

      if (!institution) {
        return reply.status(404).send({ message: 'Instituicao nao encontrada' });
      }

      return reply.status(204).send();
    } catch (error) {
      if (isForeignKeyConstraintError(error)) {
        return reply.status(409).send({ message: 'Nao e possivel remover uma instituicao vinculada a alunos' });
      }

      throw error;
    }
  });
}
