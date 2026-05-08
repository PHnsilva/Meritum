import type { FastifyInstance } from 'fastify';
import { isUniqueConstraintError } from '../shared/prisma/prisma-errors.js';
import { hashPassword, verifyPassword } from '../shared/security/password-hasher.js';

type CreateUserBody = {
  name: string;
  email: string;
  password: string;
};

type LoginUserBody = {
  email: string;
  password: string;
};

type UserResponse = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

function toUserResponse(user: UserResponse) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

const userResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
} as const;

const messageResponseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' }
  }
} as const;

export async function userRoutes(app: FastifyInstance) {
  app.get('/users', {
    schema: {
      tags: ['Users'],
      summary: 'Lista usuarios cadastrados',
      response: {
        200: {
          type: 'array',
          items: userResponseSchema
        }
      }
    }
  }, async () => {
    const users = await app.prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return users.map(toUserResponse);
  });

  app.post<{ Body: CreateUserBody }>('/users', {
    schema: {
      tags: ['Users'],
      summary: 'Cria um usuario',
      body: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 2 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      },
      response: {
        201: userResponseSchema,
        409: messageResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const user = await app.prisma.user.create({
        data: {
          name: request.body.name,
          email: request.body.email,
          passwordHash: hashPassword(request.body.password)
        }
      });

      return reply.status(201).send(toUserResponse(user));
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        return reply.status(409).send({ message: 'Usuario ja cadastrado com o email informado' });
      }

      throw error;
    }
  });

  app.post<{ Body: LoginUserBody }>('/users/login', {
    schema: {
      tags: ['Users'],
      summary: 'Autentica um usuario por email e senha',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            user: userResponseSchema
          }
        },
        401: messageResponseSchema
      }
    }
  }, async (request, reply) => {
    const user = await app.prisma.user.findUnique({
      where: { email: request.body.email }
    });

    if (!user?.passwordHash || !verifyPassword(request.body.password, user.passwordHash)) {
      return reply.status(401).send({ message: 'Email ou senha invalidos' });
    }

    return {
      user: toUserResponse(user)
    };
  });
}
