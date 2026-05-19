import type { PrismaClient, Prisma } from '@prisma/client';

export type PrismaTx = Prisma.TransactionClient;

export interface UnitOfWork {
  run<T>(fn: (tx: PrismaTx) => Promise<T>): Promise<T>;
}

export function createUnitOfWork(prisma: PrismaClient): UnitOfWork {
  return {
    run<T>(fn: (tx: PrismaTx) => Promise<T>): Promise<T> {
      return prisma.$transaction(fn);
    }
  };
}
