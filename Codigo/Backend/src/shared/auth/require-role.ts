import type { FastifyReply, FastifyRequest } from 'fastify';

type Role = 'admin' | 'student' | 'professor' | 'partner';

export function requireRole(...roles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const role = (request.user as { role?: string } | undefined)?.role;
    if (!role || !roles.includes(role as Role)) {
      return reply.status(403).send({ message: 'Acesso nao autorizado para este perfil' });
    }
  };
}
