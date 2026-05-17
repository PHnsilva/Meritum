import Fastify from 'fastify';
import cors from '@fastify/cors';
import { prismaPlugin } from './plugins/prisma.js';
import { swaggerPlugin } from './plugins/swagger.js';
import { healthRoutes } from './routes/health.routes.js';
import { institutionRoutes } from './modules/instituicao/action/institution.routes.js';
import { studentRoutes } from './modules/aluno/action/student.routes.js';
import { partnerCompanyRoutes } from './modules/parceiro/action/partner-company.routes.js';
import { professorRoutes } from './modules/professor/action/professor.routes.js';
import { professorActivationRoutes } from './modules/professor/action/professor-activation.routes.js';
import { authRoutes } from './modules/auth/action/auth.routes.js';
import { coinRoutes } from './modules/moeda/action/coin.routes.js';

export async function buildApp() {
  const app = Fastify({
    logger: true
  });

  await app.register(cors, {
    origin: true
  });

  await app.register(swaggerPlugin);
  await app.register(prismaPlugin);

  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(institutionRoutes);
  await app.register(studentRoutes);
  await app.register(partnerCompanyRoutes);
  await app.register(professorRoutes);
  await app.register(professorActivationRoutes);
  await app.register(coinRoutes);

  return app;
}
