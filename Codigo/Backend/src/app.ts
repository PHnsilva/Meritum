import type { FastifyInstance } from 'fastify';
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
import { newsRoutes } from './modules/news/action/news.routes.js';
import { eventBus } from './shared/domain/events/event-bus.js';
import { MoedasEnviadasEvent } from './shared/domain/events/moedas-enviadas-event.js';
import { VantagemResgataEvent } from './shared/domain/events/vantagem-resgata-event.js';
import { ParceiroRegistradoEvent } from './shared/domain/events/parceiro-registrado-event.js';
import { ParceiroAprovadoEvent } from './shared/domain/events/parceiro-aprovado-event.js';
import { InstituicaoRegistradaEvent } from './shared/domain/events/instituicao-registrada-event.js';
import { InstituicaoAprovadaEvent } from './shared/domain/events/instituicao-aprovada-event.js';
import { AlunoCriadoEvent } from './shared/domain/events/aluno-criado-event.js';
import { ProfessorCriadoEvent } from './shared/domain/events/professor-criado-event.js';
import { ProfessorAtivacaoSolicitadaEvent } from './shared/domain/events/professor-ativacao-solicitada-event.js';
import { UserPasswordChangedEvent } from './shared/domain/events/user-password-changed-event.js';
import {
  sendCoinReceivedEmail,
  sendCoinSentConfirmationEmail,
  sendStudentCouponEmail,
  sendPartnerRedemptionEmail,
  sendPartnerRegistrationEmail,
  sendPartnerApprovalEmail,
  sendInstitutionRegistrationEmail,
  sendInstitutionApprovalEmail,
  sendProfessorActivationEmail,
  sendStudentWelcomeEmail,
} from './shared/email/email-service.js';
import { createAuthService } from './modules/auth/application/auth-service.js';
import { PrismaUserRepository } from './modules/auth/infra/prisma-user.repository.js';
import { createStudentService } from './modules/aluno/application/student-service.js';
import { PrismaStudentRepository } from './modules/aluno/infra/prisma-student.repository.js';
import { createProfessorService } from './modules/professor/application/professor-service.js';
import { PrismaProfessorRepository } from './modules/professor/infra/prisma-professor.repository.js';
import { createInstitutionService } from './modules/instituicao/application/institution-service.js';
import { PrismaInstitutionRepository } from './modules/instituicao/infra/prisma-institution.repository.js';
import { createPartnerCompanyService } from './modules/parceiro/application/partner-company-service.js';
import { PrismaPartnerRepository } from './modules/parceiro/infra/prisma-partner.repository.js';
import { createCoinService } from './modules/moeda/application/coin-service.js';
import { PrismaProfessorBalanceRepository } from './modules/moeda/infra/prisma-professor-balance.repository.js';
import { PrismaStudentBalanceRepository } from './modules/moeda/infra/prisma-student-balance.repository.js';
import { PrismaTransactionRepository } from './modules/moeda/infra/prisma-transaction.repository.js';
import { createUnitOfWork } from './shared/infra/unit-of-work.js';
import { createAdvantageService } from './modules/vantagem/application/advantage-service.js';
import { PrismaAdvantageRepository } from './modules/vantagem/infra/prisma-advantage.repository.js';
import { PrismaStudentCoinRepository } from './modules/vantagem/infra/prisma-student-coin.repository.js';
import { CoinQueryAdapter } from './modules/moeda/infra/coin-query.adapter.js';
import { AdvantageQueryAdapter } from './modules/vantagem/infra/advantage-query.adapter.js';
import { RabbitMqEventTransport } from './shared/infra/messaging/rabbitmq-event-transport.js';

declare module 'fastify' {
  interface FastifyInstance {
    authService: ReturnType<typeof createAuthService>;
    studentService: ReturnType<typeof createStudentService>;
    professorService: ReturnType<typeof createProfessorService>;
    institutionService: ReturnType<typeof createInstitutionService>;
    partnerService: ReturnType<typeof createPartnerCompanyService>;
    coinService: ReturnType<typeof createCoinService>;
    advantageService: ReturnType<typeof createAdvantageService>;
  }
}

async function registerEventHandlers() {
  eventBus.clearSubscribers();

  await eventBus.subscribe(MoedasEnviadasEvent, async (e) => {
    await Promise.allSettled([
      sendCoinReceivedEmail({ studentName: e.studentName, studentEmail: e.studentEmail, professorName: e.professorName, amount: e.amount, motive: e.motive }),
      sendCoinSentConfirmationEmail({ professorName: e.professorName, professorEmail: e.professorEmail, studentName: e.studentName, amount: e.amount, motive: e.motive }),
    ]);
  });

  await eventBus.subscribe(VantagemResgataEvent, async (e) => {
    await Promise.allSettled([
      sendStudentCouponEmail(e.studentEmail, e.studentName, e.advantageTitle, e.partnerName, e.coinCost, e.code),
      sendPartnerRedemptionEmail(e.partnerEmail, e.partnerName, e.studentName, e.advantageTitle, e.coinCost, e.code),
    ]);
  });

  await eventBus.subscribe(ParceiroRegistradoEvent, async (e) => {
    await sendPartnerRegistrationEmail(e.partnerEmail, e.partnerName);
  });

  await eventBus.subscribe(ParceiroAprovadoEvent, async (e) => {
    await sendPartnerApprovalEmail(e.partnerEmail, e.partnerName);
  });

  await eventBus.subscribe(InstituicaoRegistradaEvent, async (e) => {
    await sendInstitutionRegistrationEmail(e.userEmail, e.institutionName);
  });

  await eventBus.subscribe(InstituicaoAprovadaEvent, async (e) => {
    await sendInstitutionApprovalEmail(e.userEmail, e.userName);
  });

  await eventBus.subscribe(AlunoCriadoEvent, async (e) => {
    await sendStudentWelcomeEmail(e.studentEmail, e.studentName, e.institutionName);
  });

  await eventBus.subscribe(ProfessorCriadoEvent, async (e) => {
    await sendProfessorActivationEmail(e.professorEmail, e.professorName, e.tempPassword);
  });

  await eventBus.subscribe(ProfessorAtivacaoSolicitadaEvent, async (e) => {
    await sendProfessorActivationEmail(e.professorEmail, e.professorName, e.tempPassword);
  });

  await eventBus.subscribe(UserPasswordChangedEvent, async (e) => {
    console.log(`[SECURITY] User password changed: ${e.userEmail} (${e.userId})`);
  });
}

async function configureEventTransport(app: FastifyInstance) {
  const rabbitUrl = process.env.RABBITMQ_URL;

  if (!rabbitUrl) {
    app.log.info('RabbitMQ disabled. Domain events will use the in-memory event bus.');
    return;
  }

  const transport = new RabbitMqEventTransport(
    rabbitUrl,
    process.env.RABBITMQ_EXCHANGE ?? 'meritum.domain-events',
    process.env.RABBITMQ_QUEUE_PREFIX ?? 'meritum'
  );

  await transport.connect();
  eventBus.useTransport(transport);
  app.log.info('RabbitMQ enabled for domain events.');

  app.addHook('onClose', async () => {
    await eventBus.closeTransport();
  });
}

function registerServiceFactories(app: FastifyInstance) {
  const userRepo = new PrismaUserRepository(app.prisma);
  app.decorate('authService', createAuthService(userRepo));

  const studentRepo = new PrismaStudentRepository(app.prisma);
  app.decorate('studentService', createStudentService(studentRepo));

  const professorRepo = new PrismaProfessorRepository(app.prisma);
  app.decorate('professorService', createProfessorService(professorRepo));

  const institutionRepo = new PrismaInstitutionRepository(app.prisma);
  const coinQueryAdapter = new CoinQueryAdapter(app.prisma);
  const advantageQueryAdapter = new AdvantageQueryAdapter(app.prisma);
  app.decorate('institutionService', createInstitutionService(institutionRepo, coinQueryAdapter, advantageQueryAdapter));

  const partnerRepo = new PrismaPartnerRepository(app.prisma);
  app.decorate('partnerService', createPartnerCompanyService(partnerRepo));

  const professorBalanceRepo = new PrismaProfessorBalanceRepository(app.prisma);
  const studentBalanceRepo = new PrismaStudentBalanceRepository(app.prisma);
  const transactionRepo = new PrismaTransactionRepository(app.prisma);
  const uow = createUnitOfWork(app.prisma);
  app.decorate('coinService', createCoinService(professorBalanceRepo, studentBalanceRepo, transactionRepo, uow));

  const advantageRepo = new PrismaAdvantageRepository(app.prisma);
  const studentCoinRepo = new PrismaStudentCoinRepository(app.prisma);
  app.decorate('advantageService', createAdvantageService(advantageRepo, studentCoinRepo, uow));
}

export async function buildApp() {
  const app = Fastify({ logger: true });

  await configureEventTransport(app);
  await registerEventHandlers();

  await app.register(cors, { origin: true });

  await app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      message: 'Muitas requisicoes. Aguarde um momento antes de tentar novamente.',
    }),
  });

  await app.register(swaggerPlugin);
  await app.register(prismaPlugin);
  await app.register(jwtPlugin);

  registerServiceFactories(app);

  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(institutionRoutes);
  await app.register(studentRoutes);
  await app.register(partnerCompanyRoutes);
  await app.register(professorRoutes);
  await app.register(professorActivationRoutes);
  await app.register(coinRoutes);
  await app.register(advantageRoutes);
  await app.register(newsRoutes);

  return app;
}
