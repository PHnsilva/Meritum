import type { FastifyInstance } from 'fastify';
import { verifyPassword } from '../../../shared/security/password-hasher.js';

type LoginBody = { email: string; password: string };

const authResponseSchema = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'string', enum: ['student', 'professor', 'partner'] },
        coinBalance: { type: 'integer', nullable: true },
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
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    };
  });
}
