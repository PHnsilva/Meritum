import type { FastifyInstance } from 'fastify';
import { createProfessorService } from '../application/professor-service.js';
import { PrismaProfessorRepository } from '../infra/prisma-professor.repository.js';
import { sendProfessorActivationEmail } from '../../../shared/email/email-service.js';

const messageSchema = { type: 'object', properties: { message: { type: 'string' } } } as const;

export async function professorActivationRoutes(app: FastifyInstance) {
  const professorService = createProfessorService(new PrismaProfessorRepository(app.prisma));

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
    const result = await professorService.requestActivation(request.body.email);

    // Dispara email apenas se professor existir — nunca vaza a existência do email
    if (result) {
      void sendProfessorActivationEmail(result.userEmail, result.userName, result.tempPassword);
    }

    return { message: 'Se o email estiver cadastrado, voce recebera a senha temporaria em instantes.' };
  });
}
