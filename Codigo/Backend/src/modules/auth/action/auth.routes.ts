import type { FastifyInstance } from 'fastify';
import { verifyPassword } from '../../../shared/security/password-hasher.js';

type LoginBody = { email: string; password: string };
type PerfilBody = { entityId: string; name?: string; email?: string };

const authResponseSchema = {
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

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: LoginBody }>('/api/auth/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Login unificado para aluno, professor e empresa parceira',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      },
      response: {
        200: authResponseSchema,
        401: { type: 'object', properties: { message: { type: 'string' } } }
      }
    }
  }, async (request, reply) => {
    const { email, password } = request.body;

    const user = await app.prisma.user.findUnique({
      where: { email },
      include: { student: true, professor: true, partnerCompany: true }
    });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return reply.status(401).send({ message: 'Email ou senha invalidos' });
    }

    const coinBalance = user.student?.coinBalance ?? user.professor?.coinBalance ?? null;
    const entityId = user.student?.id ?? user.professor?.id ?? user.partnerCompany?.id ?? user.id;

    return {
      user: {
        id: entityId,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(),
        coinBalance,
        mustChangePassword: user.mustChangePassword,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    };
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
      }
    }
  }, async (request, reply) => {
    const { entityId, name, email } = request.body;

    const user = await app.prisma.user.findUnique({ where: { id: entityId } });
    if (!user) return reply.status(404).send({ message: 'Usuario nao encontrado' });

    await app.prisma.user.update({
      where: { id: entityId },
      data: {
        ...(name ? { name } : {}),
        ...(email ? { email } : {})
      }
    });

    return { message: 'Perfil atualizado com sucesso' };
  });
}
