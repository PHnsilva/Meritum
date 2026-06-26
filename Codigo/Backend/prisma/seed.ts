import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/shared/security/password-hasher.js';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@meritum.com';
  const password =
    process.env.ADMIN_PASSWORD ??
    (process.env.NODE_ENV === 'production' ? undefined : 'admin123');

  if (!password) {
    console.warn(
      '[seed] ADMIN_PASSWORD nao definido em producao — admin NAO criado. Defina ADMIN_PASSWORD no ambiente e rode o deploy novamente.'
    );
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin ja existe:', email);
    return;
  }

  await prisma.user.create({
    data: {
      name: 'Administrador',
      email,
      passwordHash: hashPassword(password),
      role: 'ADMIN',
      mustChangePassword: false
    }
  });

  console.log(`Admin criado — email: ${email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
