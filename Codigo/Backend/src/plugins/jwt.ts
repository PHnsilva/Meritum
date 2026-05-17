import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; role: string };
    user: { sub: string; role: string };
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export const jwtPlugin = fp(async (app: FastifyInstance) => {
  await app.register(jwt, {
    secret: process.env.JWT_SECRET ?? 'meritum-dev-secret-key-change-in-prod',
    sign: { expiresIn: '8h' }
  });

  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ message: 'Token invalido ou expirado' });
    }
  });
});
