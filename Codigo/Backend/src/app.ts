import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { prismaPlugin } from './plugins/prisma.js';
import { swaggerPlugin } from './plugins/swagger.js';
import { jwtPlugin } from './plugins/jwt.js';
import { healthRoutes } from './routes/health.routes.js';
import { institutionRoutes } from './modules/instituicao/action/institution.routes.js';
import { studentRoutes } from './modules/aluno/action/student.routes.js';
import { partnerCompanyRoutes } from './modules/parceiro/action/partner-company.routes.js';
import { professorRoutes } from './modules/professor/action/professor.routes.js';
import { professorActivationRoutes } from './modules/professor/action/professor-activation.routes.js';
import { authRoutes } from './modules/auth/action/auth.routes.js';
import { coinRoutes } from './modules/moeda/action/coin.routes.js';
import { advantageRoutes } from './modules/vantagem/action/advantage.routes.js';
import { eventBus } from './shared/domain/events/event-bus.js';
import { MoedasEnviadasEvent } from './shared/domain/events/moedas-enviadas-event.js';
import { sendCoinReceivedEmail, sendCoinSentConfirmationEmail } from './shared/email/email-service.js';

function registerEventHandlers() {
  eventBus.subscribe(MoedasEnviadasEvent, async (e) => {
    await Promise.allSettled([
      sendCoinReceivedEmail({ studentName: e.studentName, studentEmail: e.studentEmail, professorName: e.professorName, amount: e.amount, motive: e.motive }),
      sendCoinSentConfirmationEmail({ professorName: e.professorName, professorEmail: e.professorEmail, studentName: e.studentName, amount: e.amount, motive: e.motive })
    ]);
  });
}

export async function buildApp() {
  registerEventHandlers();

  const app = Fastify({
    logger: true
  });

  await app.register(cors, { origin: true });

  await app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      message: 'Muitas requisicoes. Aguarde um momento antes de tentar novamente.'
    })
  });

  await app.register(swaggerPlugin);
  await app.register(prismaPlugin);
  await app.register(jwtPlugin);

  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(institutionRoutes);
  await app.register(studentRoutes);
  await app.register(partnerCompanyRoutes);
  await app.register(professorRoutes);
  await app.register(professorActivationRoutes);
  await app.register(coinRoutes);
  await app.register(advantageRoutes);

  return app;
}
