import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
    log: ['query'],
})//cada query que for feita no BD, ele vai mostrar no Log
