import { prisma } from '@/lib/prisma';
import { requireEmployer } from '@/lib/auth/guards';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const authed = await requireEmployer();
  if ('response' in authed) return authed.response;

  const resumes = await prisma.accounts.findMany({
    where: {
      resumeBlobURL: { not: null },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      majors: true,
      gradYear: true,
      linkedin: true,
      resumeBlobURL: true,
    },
    orderBy: [
      { lastName: 'asc' },
      { firstName: 'asc' },
    ],
  });

  return NextResponse.json({ resumes });
}