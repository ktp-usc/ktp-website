import { prisma } from '@/lib/prisma';

export function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? '';
}

export async function findEmployerByEmail(email: string | null | undefined) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  return prisma.employers.findFirst({
    where: {
      email: {
        equals: normalizedEmail,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      email: true,
      companyName: true,
      approved: true,
      createdAt: true,
    },
  });
}

export async function findApprovedEmployerByEmail(email: string | null | undefined) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  return prisma.employers.findFirst({
    where: {
      approved: true,
      email: {
        equals: normalizedEmail,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      email: true,
      companyName: true,
      approved: true,
      createdAt: true,
    },
  });
}

export async function isApprovedEmployerEmail(email: string | null | undefined) {
  return Boolean(await findApprovedEmployerByEmail(email));
}
