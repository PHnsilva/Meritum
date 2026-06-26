import type { FastifyInstance } from 'fastify';
import { eventBus } from '../../../shared/domain/events/event-bus.js';
import { ProfessorAtivacaoSolicitadaEvent } from '../../../shared/domain/events/professor-ativacao-solicitada-event.js';

const messageSchema = { type: 'object', properties: { message: { type: 'string' } } } as const;

export async function professorActivationRoutes(app: FastifyInstance) {
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
    const result = await app.professorService.requestActivation(request.body.email);

    // Dispara evento apenas se professor existir — nunca vaza a existência do email
    if (result) {
      request.log.info(`[ativacao] professor encontrado para ${result.userEmail} — publicando evento de ativacao`);
      eventBus.publish(new ProfessorAtivacaoSolicitadaEvent(result.userEmail, result.userName, result.tempPassword));
    } else {
      request.log.warn(`[ativacao] NENHUM professor encontrado com o email "${request.body.email}" — nada sera enviado`);
    }

    return { message: 'Se o email estiver cadastrado, voce recebera a senha temporaria em instantes.' };
  });
}
