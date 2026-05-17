import type { FastifyInstance } from 'fastify';
import { createStudentService, type CreateStudentInput, type UpdateStudentInput } from '../application/student-service.js';
import { toStudentListResponse, toStudentResponse } from '../responder/student-responder.js';
import { isUniqueConstraintError } from '../../../shared/prisma/prisma-errors.js';

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

const notFoundSchema = {
  type: 'object',
  properties: { message: { type: 'string' } }
} as const;

const conflictSchema = {
  type: 'object',
  properties: { message: { type: 'string' } }
} as const;

export async function studentRoutes(app: FastifyInstance) {
  const studentService = createStudentService(app);

  app.get<{ Querystring: { institutionId?: string } }>('/api/alunos', {
    schema: {
      tags: ['Alunos'],
      summary: 'Lista alunos cadastrados',
      querystring: {
        type: 'object',
        properties: { institutionId: { type: 'string', format: 'uuid' } }
      },
      response: {
        200: {
          type: 'array',
          items: studentResponseSchema
        }
      }
    }
  }, async (request) => {
    const students = await studentService.list(request.query.institutionId);
    return toStudentListResponse(students);
  });

  app.get<{ Params: { id: string } }>('/api/alunos/:id', {
    schema: {
      tags: ['Alunos'],
      summary: 'Consulta um aluno pelo identificador',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } }
      },
      response: {
        200: studentResponseSchema,
        404: notFoundSchema
      }
    }
  }, async (request, reply) => {
    const student = await studentService.findById(request.params.id);

    if (!student) {
      return reply.status(404).send({ message: 'Aluno nao encontrado' });
    }

    return toStudentResponse(student);
  });

  app.post<{ Body: CreateStudentInput }>('/api/alunos', {
    schema: {
      tags: ['Alunos'],
      summary: 'Cadastra um aluno',
      body: studentBodySchema,
      response: {
        201: studentResponseSchema,
        404: notFoundSchema,
        409: conflictSchema
      }
    }
  }, async (request, reply) => {
    try {
      const student = await studentService.create(request.body);
      return reply.status(201).send(toStudentResponse(student));
    } catch (error) {
      if (error instanceof Error && error.name === 'InstitutionNotFoundError') {
        return reply.status(404).send({ message: error.message });
      }

      if (isUniqueConstraintError(error)) {
        return reply.status(409).send({ message: 'Aluno ja cadastrado com email, CPF ou RG informado' });
      }

      throw error;
    }
  });

  app.put<{ Params: { id: string }; Body: UpdateStudentInput }>('/api/alunos/:id', {
    schema: {
      tags: ['Alunos'],
      summary: 'Atualiza um aluno',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } }
      },
      body: updateStudentBodySchema,
      response: {
        200: studentResponseSchema,
        404: notFoundSchema,
        409: conflictSchema
      }
    }
  }, async (request, reply) => {
    try {
      const student = await studentService.update(request.params.id, request.body);

      if (!student) {
        return reply.status(404).send({ message: 'Aluno nao encontrado' });
      }

      return toStudentResponse(student);
    } catch (error) {
      if (error instanceof Error && error.name === 'InstitutionNotFoundError') {
        return reply.status(404).send({ message: error.message });
      }

      if (isUniqueConstraintError(error)) {
        return reply.status(409).send({ message: 'Aluno ja cadastrado com email, CPF ou RG informado' });
      }

      throw error;
    }
  });

  app.delete<{ Params: { id: string } }>('/api/alunos/:id', {
    schema: {
      tags: ['Alunos'],
      summary: 'Remove um aluno',
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
    const student = await studentService.delete(request.params.id);

    if (!student) {
      return reply.status(404).send({ message: 'Aluno nao encontrado' });
    }

    return reply.status(204).send();
  });
}
