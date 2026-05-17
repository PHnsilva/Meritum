import type { FastifyInstance } from 'fastify';
import { generateTempPassword, hashPassword } from '../../../shared/security/password-hasher.js';
import { sendProfessorActivationEmail } from '../../../shared/email/email-service.js';

const messageSchema = { type: 'object', properties: { message: { type: 'string' } } } as const;

export async function professorActivationRoutes(app: FastifyInstance) {
  app.post<{ Body: { email: string } }>('/api/professores/ativar', {
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
    const { email } = request.body;

    const user = await app.prisma.user.findUnique({ where: { email } });

    if (user && user.role === 'PROFESSOR') {
      const tempPassword = generateTempPassword();
      await app.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashPassword(tempPassword), mustChangePassword: true }
      });
      await sendProfessorActivationEmail(user.email, user.name, tempPassword);
    }

    // Sempre retorna a mesma mensagem para não vazar existência do email
    return { message: 'Se o email estiver cadastrado, voce recebera a senha temporaria em instantes.' };
  });

  app.post<{ Body: { email: string; newPassword: string } }>('/api/auth/alterar-senha', {
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
    const { email, newPassword } = request.body;

    const user = await app.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.status(404).send({ message: 'Usuario nao encontrado' });
    }

    await app.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(newPassword), mustChangePassword: false }
    });

    return { message: 'Senha alterada com sucesso' };
  });
}
