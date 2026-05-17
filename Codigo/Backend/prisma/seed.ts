import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/shared/security/password-hasher.js';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@meritum.com';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin ja existe:', email);
    return;
  }

  await prisma.user.create({
    data: {
      name: 'Administrador',
      email,
      passwordHash: hashPassword('admin123'),
      role: 'ADMIN',
      mustChangePassword: false
    }
  });

  console.log('Admin criado — email: admin@meritum.com | senha: admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
