import type { FastifyInstance } from 'fastify';
import { sendErrorResponse } from '../../../shared/responder/error-responder.js';
import { requireRole } from '../../../shared/auth/require-role.js';
import { createStudentService, type CreateStudentInput, type UpdateStudentInput } from '../application/student-service.js';
import { PrismaStudentRepository } from '../infra/prisma-student.repository.js';
import { toStudentListResponse, toStudentResponse } from '../responder/student-responder.js';

const studentResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    cpf: { type: 'string' },
    rg: { type: 'string' },
    address: { type: 'string' },
    course: { type: 'string' },
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

const studentBodySchema = {
  type: 'object',
  required: ['name', 'email', 'cpf', 'rg', 'address', 'institutionId', 'course', 'password'],
  properties: {
    name: { type: 'string', minLength: 2 },
    email: { type: 'string', format: 'email' },
    cpf: { type: 'string', minLength: 11 },
    rg: { type: 'string', minLength: 3 },
    address: { type: 'string', minLength: 3 },
    institutionId: { type: 'string', format: 'uuid' },
    course: { type: 'string', minLength: 2 },
    password: { type: 'string', minLength: 6 }
  }
} as const;

const updateStudentBodySchema = {
  type: 'object',
  minProperties: 1,
  properties: studentBodySchema.properties
} as const;

const errorSchema = { type: 'object', properties: { message: { type: 'string' } } } as const;

const paginatedStudentSchema = {
  type: 'object',
  properties: {
    data: { type: 'array', items: studentResponseSchema },
    total: { type: 'integer' },
    page: { type: 'integer' },
    limit: { type: 'integer' },
    totalPages: { type: 'integer' }
  }
} as const;

export async function studentRoutes(app: FastifyInstance) {
  const studentService = createStudentService(new PrismaStudentRepository(app.prisma));

  // Public — student self-registration
  app.post<{ Body: CreateStudentInput }>('/api/auth/register', {
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
    schema: {
      tags: ['Auth'],
      summary: 'Cadastro publico de aluno (auto-registro)',
      body: studentBodySchema,
      response: { 201: { type: 'object', properties: { message: { type: 'string' } } }, 409: errorSchema }
    }
  }, async (request, reply) => {
    try {
      await studentService.create(request.body);
      return reply.status(201).send({ message: 'Conta criada com sucesso. Faca login para continuar.' });
    } catch (error) {
      return sendErrorResponse(reply, error, 'Email, CPF ou RG ja cadastrado');
    }
  });

  app.get<{ Querystring: { institutionId?: string; page?: number; limit?: number } }>('/api/alunos', {
    preHandler: [app.authenticate, requireRole('admin', 'professor', 'institution')],
    schema: {
      tags: ['Alunos'],
      summary: 'Lista alunos cadastrados (paginado)',
      querystring: {
        type: 'object',
        properties: {
          institutionId: { type: 'string', format: 'uuid' },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 200, default: 50 }
        }
      },
      response: { 200: paginatedStudentSchema }
    }
  }, async (request) => {
    const { institutionId, page = 1, limit = 50 } = request.query;
    const result = await studentService.list(institutionId, page, limit);
    return { ...result, data: toStudentListResponse(result.data) };
  });

  app.get<{ Params: { id: string } }>('/api/alunos/:id', {
    preHandler: [app.authenticate, requireRole('admin', 'professor', 'student')],
    schema: {
      tags: ['Alunos'],
      summary: 'Consulta um aluno pelo identificador',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      response: { 200: studentResponseSchema, 404: errorSchema }
    }
  }, async (request, reply) => {
    const student = await studentService.findById(request.params.id);
    if (!student) return reply.status(404).send({ message: 'Aluno nao encontrado' });
    return toStudentResponse(student);
  });

  app.post<{ Body: CreateStudentInput }>('/api/alunos', {
    preHandler: [app.authenticate, requireRole('admin')],
    schema: {
      tags: ['Alunos'],
      summary: 'Cadastra um aluno',
      body: studentBodySchema,
      response: { 201: studentResponseSchema, 404: errorSchema, 409: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const student = await studentService.create(request.body);
      return reply.status(201).send(toStudentResponse(student));
    } catch (error) {
      return sendErrorResponse(reply, error, 'Aluno ja cadastrado com email, CPF ou RG informado');
    }
  });

  app.put<{ Params: { id: string }; Body: UpdateStudentInput }>('/api/alunos/:id', {
    preHandler: [app.authenticate, requireRole('admin', 'student')],
    schema: {
      tags: ['Alunos'],
      summary: 'Atualiza um aluno',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      body: updateStudentBodySchema,
      response: { 200: studentResponseSchema, 404: errorSchema, 409: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const student = await studentService.update(request.params.id, request.body);
      if (!student) return reply.status(404).send({ message: 'Aluno nao encontrado' });
      return toStudentResponse(student);
    } catch (error) {
      return sendErrorResponse(reply, error, 'Aluno ja cadastrado com email, CPF ou RG informado');
    }
  });

  app.delete<{ Params: { id: string } }>('/api/alunos/:id', {
    preHandler: [app.authenticate, requireRole('admin')],
    schema: {
      tags: ['Alunos'],
      summary: 'Remove um aluno',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      response: { 204: { type: 'null' }, 404: errorSchema }
    }
  }, async (request, reply) => {
    const student = await studentService.delete(request.params.id);
    if (!student) return reply.status(404).send({ message: 'Aluno nao encontrado' });
    return reply.status(204).send();
  });
}

