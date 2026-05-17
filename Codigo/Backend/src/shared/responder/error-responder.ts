import type { FastifyReply } from 'fastify';
import { isForeignKeyConstraintError, isUniqueConstraintError } from '../prisma/prisma-errors.js';

const domainErrorStatus: Record<string, number> = {
  ProfessorNotFoundError: 404,
  StudentNotFoundError: 404,
  InstitutionNotFoundError: 404,
  UserNotFoundError: 404,
  PartnerNotFoundError: 404,
  InsufficientBalanceError: 400,
  DifferentInstitutionError: 400,
  ValidationError: 422,
};

export function sendErrorResponse(
  reply: FastifyReply,
  error: unknown,
  conflictMessage?: string
): ReturnType<FastifyReply['send']> {
  if (!(error instanceof Error)) throw error;

  if (isUniqueConstraintError(error)) {
    return reply.status(409).send({ message: conflictMessage ?? 'Registro ja existe com os dados informados' });
  }

  if (isForeignKeyConstraintError(error)) {
    return reply.status(409).send({ message: 'Nao e possivel remover pois existem registros vinculados' });
  }

  const status = domainErrorStatus[error.name];
  if (status) {
    return reply.status(status).send({ message: error.message });
  }

  throw error;
}
