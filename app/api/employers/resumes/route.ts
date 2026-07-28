import { prisma } from '@/lib/prisma';
import { requireEmployer } from '@/lib/auth/guards';
import { NextResponse } from 'next/server';
import { type as AccountType } from '@prisma/client';

export const runtime = 'nodejs';

export async function GET() {
  const authed = await requireEmployer();
  if ('response' in authed) return authed.response;

  const accounts = await prisma.accounts.findMany({
    where: {
      type: { in: [AccountType.BROTHER, AccountType.LEADERSHIP] },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      majors: true,
      gradYear: true,
      linkedin: true,
      headshotBlobURL: true,
      resumeBlobURL: true,
    },
    orderBy: [
      { lastName: 'asc' },
      { firstName: 'asc' },
    ],
  });

  // A member is in the bank only if they have an uploaded resume. Exec removing one drops
  // them from this list, which is the intended way to hide someone from employers.
  const resumes = accounts
    .filter((student) => Boolean(student.resumeBlobURL))
    .map((student) => ({
      ...student,
      resumeBlobURL: `/api/employers/resumes/${student.id}`,
    }));

  return NextResponse.json({ resumes });
}
