import type { FastifyInstance } from 'fastify';
import { createAuthService, type LoginInput, type UpdatePerfilInput } from '../application/auth-service.js';
import { toAuthUserResponse } from '../responder/auth-responder.js';
import { sendErrorResponse } from '../../../shared/responder/error-responder.js';

const authUserSchema = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'string', enum: ['admin', 'student', 'professor', 'partner'] },
        coinBalance: { type: 'integer', nullable: true },
        mustChangePassword: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  }
} as const;

const messageSchema = { type: 'object', properties: { message: { type: 'string' } } } as const;

type PerfilBody = { entityId: string } & UpdatePerfilInput;

export async function authRoutes(app: FastifyInstance) {
  const authService = createAuthService(app);

  app.post<{ Body: LoginInput }>('/api/auth/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Login unificado para todos os perfis',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      },
      response: {
        200: authUserSchema,
        401: messageSchema
      }
    }
  }, async (request, reply) => {
    const result = await authService.login(request.body);
    if (!result) return reply.status(401).send({ message: 'Email ou senha invalidos' });
    return toAuthUserResponse(result);
  });

  app.put<{ Body: PerfilBody }>('/api/auth/perfil', {
    schema: {
      tags: ['Auth'],
      summary: 'Atualizar perfil do administrador',
      body: {
        type: 'object',
        required: ['entityId'],
        properties: {
          entityId: { type: 'string' },
          name: { type: 'string', minLength: 1 },
          email: { type: 'string', format: 'email' }
        }
      },
      response: {
        200: messageSchema,
        404: messageSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { entityId, ...data } = request.body;
      await authService.updateAdminPerfil(entityId, data);
      return { message: 'Perfil atualizado com sucesso' };
    } catch (error) {
      return sendErrorResponse(reply, error);
    }
  });
}
