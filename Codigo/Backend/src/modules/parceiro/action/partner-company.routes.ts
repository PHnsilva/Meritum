import type { FastifyInstance } from 'fastify';
import type { CreatePartnerCompanyInput, RegisterPartnerCompanyInput, UpdatePartnerCompanyInput } from '../application/partner-company-service.js';
import { sendErrorResponse } from '../../../shared/responder/error-responder.js';
import { requireRole } from '../../../shared/auth/require-role.js';
import { toPartnerCompanyListResponse, toPartnerCompanyResponse } from '../responder/partner-company-responder.js';

const partnerCompanyResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    corporateName: { type: 'string' },
    tradeName: { type: 'string', nullable: true },
    email: { type: 'string', format: 'email' },
    cnpj: { type: 'string' },
    address: { type: 'string' },
    status: { type: 'string', enum: ['pending', 'approved'] },
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

const errorSchema = { type: 'object', properties: { message: { type: 'string' } } } as const;

const paginatedPartnerSchema = {
  type: 'object',
  properties: {
    data: { type: 'array', items: partnerCompanyResponseSchema },
    total: { type: 'integer' },
    page: { type: 'integer' },
    limit: { type: 'integer' },
    totalPages: { type: 'integer' }
  }
} as const;

export async function partnerCompanyRoutes(app: FastifyInstance) {

  // Public: partner self-registration (status = PENDING)
  app.post<{ Body: RegisterPartnerCompanyInput }>('/api/parceiros/solicitar', {
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
    schema: {
      tags: ['Parceiros'],
      summary: 'Solicita cadastro como empresa parceira (aguarda aprovacao)',
      body: partnerCompanyBodySchema,
      response: { 201: partnerCompanyResponseSchema, 409: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const partner = await app.partnerService.register(request.body);
      return reply.status(201).send(toPartnerCompanyResponse(partner));
    } catch (error) {
      return sendErrorResponse(reply, error, 'Empresa parceira ja cadastrada com email ou CNPJ informado');
    }
  });

  // Admin: approve a pending partner and send approval email
  app.post<{ Params: { id: string } }>('/api/parceiros/:id/aprovar', {
    preHandler: [app.authenticate, requireRole('admin')],
    schema: {
      tags: ['Parceiros'],
      summary: 'Aprova o cadastro de uma empresa parceira e envia email de confirmacao',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      response: { 200: partnerCompanyResponseSchema, 404: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const partner = await app.partnerService.approve(request.params.id);
      return toPartnerCompanyResponse(partner);
    } catch (error) {
      return sendErrorResponse(reply, error, 'Empresa parceira nao encontrada');
    }
  });

  app.get<{ Querystring: { page?: number; limit?: number; status?: 'PENDING' | 'APPROVED' } }>('/api/parceiros', {
    preHandler: [app.authenticate, requireRole('admin')],
    schema: {
      tags: ['Parceiros'],
      summary: 'Lista empresas parceiras cadastradas (paginado)',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 200, default: 50 },
          status: { type: 'string', enum: ['PENDING', 'APPROVED'] }
        }
      },
      response: { 200: paginatedPartnerSchema }
    }
  }, async (request) => {
    const { page = 1, limit = 50, status } = request.query;
    const result = await app.partnerService.list(page, limit, status);
    return { ...result, data: toPartnerCompanyListResponse(result.data) };
  });

  app.get<{ Params: { id: string } }>('/api/parceiros/:id', {
    preHandler: [app.authenticate, requireRole('admin', 'partner')],
    schema: {
      tags: ['Parceiros'],
      summary: 'Consulta uma empresa parceira pelo identificador',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      response: { 200: partnerCompanyResponseSchema, 404: errorSchema }
    }
  }, async (request, reply) => {
    const partnerCompany = await app.partnerService.findById(request.params.id);
    if (!partnerCompany) return reply.status(404).send({ message: 'Empresa parceira nao encontrada' });
    return toPartnerCompanyResponse(partnerCompany);
  });

  app.post<{ Body: CreatePartnerCompanyInput }>('/api/parceiros', {
    preHandler: [app.authenticate, requireRole('admin')],
    schema: {
      tags: ['Parceiros'],
      summary: 'Cadastra uma empresa parceira (admin — aprovada automaticamente)',
      body: partnerCompanyBodySchema,
      response: { 201: partnerCompanyResponseSchema, 409: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const partnerCompany = await app.partnerService.create(request.body);
      return reply.status(201).send(toPartnerCompanyResponse(partnerCompany));
    } catch (error) {
      return sendErrorResponse(reply, error, 'Empresa parceira ja cadastrada com email ou CNPJ informado');
    }
  });

  app.put<{ Params: { id: string }; Body: UpdatePartnerCompanyInput }>('/api/parceiros/:id', {
    preHandler: [app.authenticate, requireRole('admin', 'partner')],
    schema: {
      tags: ['Parceiros'],
      summary: 'Atualiza uma empresa parceira',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      body: updatePartnerCompanyBodySchema,
      response: { 200: partnerCompanyResponseSchema, 404: errorSchema, 409: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const partnerCompany = await app.partnerService.update(request.params.id, request.body);
      if (!partnerCompany) return reply.status(404).send({ message: 'Empresa parceira nao encontrada' });
      return toPartnerCompanyResponse(partnerCompany);
    } catch (error) {
      return sendErrorResponse(reply, error, 'Empresa parceira ja cadastrada com email ou CNPJ informado');
    }
  });

  app.delete<{ Params: { id: string } }>('/api/parceiros/:id', {
    preHandler: [app.authenticate, requireRole('admin')],
    schema: {
      tags: ['Parceiros'],
      summary: 'Remove uma empresa parceira',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      response: { 204: { type: 'null' }, 404: errorSchema }
    }
  }, async (request, reply) => {
    const partnerCompany = await app.partnerService.delete(request.params.id);
    if (!partnerCompany) return reply.status(404).send({ message: 'Empresa parceira nao encontrada' });
    return reply.status(204).send();
  });
}

