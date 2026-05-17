import type { FastifyInstance } from 'fastify';
import { createAuthService } from '../../auth/application/auth-service.js';
import { sendErrorResponse } from '../../../shared/responder/error-responder.js';
import { sendProfessorActivationEmail } from '../../../shared/email/email-service.js';

const messageSchema = { type: 'object', properties: { message: { type: 'string' } } } as const;

export async function professorActivationRoutes(app: FastifyInstance) {
  const authService = createAuthService(app);

  app.post<{ Body: { email: string } }>('/api/professores/ativar', {
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
    schema: {
      tags: ['Professores'],
      summary: 'Solicita senha temporaria para ativar conta de professor',
      body: {
        type: 'object',
        required: ['email'],
        properties: { email: { type: 'string', format: 'email' } }
      },
      response: { 200: messageSchema }
    }
  }, async (request) => {
    const result = await authService.requestActivation(request.body.email);

    // Dispara email apenas se professor existir — nunca vaza a existência do email
    if (result) {
      void sendProfessorActivationEmail(result.userEmail, result.userName, result.tempPassword);
    }

    return { message: 'Se o email estiver cadastrado, voce recebera a senha temporaria em instantes.' };
  });

  app.post<{ Body: { email: string; newPassword: string } }>('/api/auth/alterar-senha', {
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
      await authService.changePassword(request.body);
      return { message: 'Senha alterada com sucesso' };
    } catch (error) {
      return sendErrorResponse(reply, error);
    }
  });
}
