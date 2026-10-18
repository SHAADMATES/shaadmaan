import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

let prisma;
try {
  prisma = globalForPrisma.prisma || new PrismaClient();
} catch (err) {
  console.warn('[AI Studio] Database not connected — using mock', err);
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d) => d?.data ?? {},
    update: async (d) => d?.data ?? {},
    delete: async () => ({}),
    deleteMany: async () => ({ count: 0 }),
    count: async () => 0,
    aggregate: async () => ({}),
  };
  prisma = new Proxy({}, {
    get: (_, prop) => {
      if (prop === '$disconnect' || prop === '$connect') return async () => {};
      return noOp;
    }
  });
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
