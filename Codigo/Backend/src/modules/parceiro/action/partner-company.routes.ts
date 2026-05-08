import type { FastifyInstance } from 'fastify';
import { createPartnerCompanyService, type CreatePartnerCompanyInput, type UpdatePartnerCompanyInput } from '../application/partner-company-service.js';
import { toPartnerCompanyListResponse, toPartnerCompanyResponse } from '../responder/partner-company-responder.js';
import { isUniqueConstraintError } from '../../../shared/prisma/prisma-errors.js';

const partnerCompanyResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    corporateName: { type: 'string' },
    tradeName: { type: 'string', nullable: true },
    email: { type: 'string', format: 'email' },
    cnpj: { type: 'string' },
    address: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
} as const;

const partnerCompanyBodySchema = {
  type: 'object',
  required: ['corporateName', 'email', 'cnpj', 'address', 'password'],
  properties: {
    corporateName: { type: 'string', minLength: 2 },
    tradeName: { type: 'string', nullable: true },
    email: { type: 'string', format: 'email' },
    cnpj: { type: 'string', minLength: 14 },
    address: { type: 'string', minLength: 3 },
    password: { type: 'string', minLength: 6 }
  }
} as const;

const updatePartnerCompanyBodySchema = {
  type: 'object',
  minProperties: 1,
  properties: partnerCompanyBodySchema.properties
} as const;

const notFoundSchema = {
  type: 'object',
  properties: { message: { type: 'string' } }
} as const;

const conflictSchema = {
  type: 'object',
  properties: { message: { type: 'string' } }
} as const;

export async function partnerCompanyRoutes(app: FastifyInstance) {
  const partnerCompanyService = createPartnerCompanyService(app);

  app.get('/api/parceiros', {
    schema: {
      tags: ['Parceiros'],
      summary: 'Lista empresas parceiras cadastradas',
      response: {
        200: {
          type: 'array',
          items: partnerCompanyResponseSchema
        }
      }
    }
  }, async () => {
    const partnerCompanies = await partnerCompanyService.list();
    return toPartnerCompanyListResponse(partnerCompanies);
  });

  app.get<{ Params: { id: string } }>('/api/parceiros/:id', {
    schema: {
      tags: ['Parceiros'],
      summary: 'Consulta uma empresa parceira pelo identificador',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } }
      },
      response: {
        200: partnerCompanyResponseSchema,
        404: notFoundSchema
      }
    }
  }, async (request, reply) => {
    const partnerCompany = await partnerCompanyService.findById(request.params.id);

    if (!partnerCompany) {
      return reply.status(404).send({ message: 'Empresa parceira nao encontrada' });
    }

    return toPartnerCompanyResponse(partnerCompany);
  });

  app.post<{ Body: CreatePartnerCompanyInput }>('/api/parceiros', {
    schema: {
      tags: ['Parceiros'],
      summary: 'Cadastra uma empresa parceira',
      body: partnerCompanyBodySchema,
      response: {
        201: partnerCompanyResponseSchema,
        409: conflictSchema
      }
    }
  }, async (request, reply) => {
    try {
      const partnerCompany = await partnerCompanyService.create(request.body);
      return reply.status(201).send(toPartnerCompanyResponse(partnerCompany));
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        return reply.status(409).send({ message: 'Empresa parceira ja cadastrada com email ou CNPJ informado' });
      }

      throw error;
    }
  });

  app.put<{ Params: { id: string }; Body: UpdatePartnerCompanyInput }>('/api/parceiros/:id', {
    schema: {
      tags: ['Parceiros'],
      summary: 'Atualiza uma empresa parceira',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } }
      },
      body: updatePartnerCompanyBodySchema,
      response: {
        200: partnerCompanyResponseSchema,
        404: notFoundSchema,
        409: conflictSchema
      }
    }
  }, async (request, reply) => {
    try {
      const partnerCompany = await partnerCompanyService.update(request.params.id, request.body);

      if (!partnerCompany) {
        return reply.status(404).send({ message: 'Empresa parceira nao encontrada' });
      }

      return toPartnerCompanyResponse(partnerCompany);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        return reply.status(409).send({ message: 'Empresa parceira ja cadastrada com email ou CNPJ informado' });
      }

      throw error;
    }
  });

  app.delete<{ Params: { id: string } }>('/api/parceiros/:id', {
    schema: {
      tags: ['Parceiros'],
      summary: 'Remove uma empresa parceira',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } }
      },
      response: {
        204: { type: 'null' },
        404: notFoundSchema
      }
    }
  }, async (request, reply) => {
    const partnerCompany = await partnerCompanyService.delete(request.params.id);

    if (!partnerCompany) {
      return reply.status(404).send({ message: 'Empresa parceira nao encontrada' });
    }

    return reply.status(204).send();
  });
}
