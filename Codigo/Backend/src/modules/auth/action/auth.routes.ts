import type { FastifyInstance } from 'fastify';
import type { LoginInput, UpdatePerfilInput, ChangePasswordInput } from '../application/auth-service.js';
import { toAuthUserResponse } from '../responder/auth-responder.js';
import { sendErrorResponse } from '../../../shared/responder/error-responder.js';
import { requireRole } from '../../../shared/auth/require-role.js';

const authUserSchema = {
  type: 'object',
  properties: {
    token: { type: 'string' },
    user: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'string', enum: ['admin', 'student', 'professor', 'partner', 'institution'] },
        coinBalance: { type: 'integer', nullable: true },
        mustChangePassword: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  }
} as const;

const messageSchema = { type: 'object', properties: { message: { type: 'string' } } } as const;
const tokenSchema = { type: 'object', properties: { token: { type: 'string' } } } as const;

type PerfilBody = { entityId: string } & UpdatePerfilInput;

export async function authRoutes(app: FastifyInstance) {

  app.post<{ Body: LoginInput }>('/api/auth/login', {
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
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
      response: { 200: authUserSchema, 401: messageSchema }
    }
  }, async (request, reply) => {
    try {
      const result = await app.authService.login(request.body);
      if (!result) return reply.status(401).send({ message: 'Email ou senha invalidos' });
      const token = app.jwt.sign({ sub: result.id, role: result.role });
      return toAuthUserResponse(result, token);
    } catch (error) {
      if (error instanceof Error && error.name === 'AccountPendingError') {
        return reply.status(403).send({ message: error.message });
      }
      throw error;
    }
  });

  app.post('/api/auth/refresh', {
    preHandler: [app.authenticate],
    schema: {
      tags: ['Auth'],
      summary: 'Renova o token JWT (retorna novo token com 8h)',
      response: { 200: tokenSchema, 401: messageSchema }
    }
  }, async (request) => {
    const { sub, role } = request.user as { sub: string; role: string };
    const token = app.jwt.sign({ sub, role });
    return { token };
  });

  app.post<{ Body: ChangePasswordInput }>('/api/auth/alterar-senha', {
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
    schema: {
      tags: ['Auth'],
      summary: 'Troca senha temporaria por senha definitiva',
      body: {
        type: 'object',
        required: ['email', 'newPassword'],
        properties: {
          email: { type: 'string', format: 'email' },
          newPassword: { type: 'string', minLength: 6 }
        }
      },
      response: { 200: messageSchema, 404: messageSchema }
    }
  }, async (request, reply) => {
    try {
      await app.authService.changePassword(request.body);
      return { message: 'Senha alterada com sucesso' };
    } catch (error) {
      return sendErrorResponse(reply, error);
    }
  });

  app.put<{ Body: PerfilBody }>('/api/auth/perfil', {
    preHandler: [app.authenticate, requireRole('admin')],
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
      response: { 200: messageSchema, 404: messageSchema }
    }
  }, async (request, reply) => {
    try {
      const { entityId, ...data } = request.body;
      await app.authService.updateAdminPerfil(entityId, data);
      return { message: 'Perfil atualizado com sucesso' };
    } catch (error) {
      return sendErrorResponse(reply, error);
    }
  });
}

