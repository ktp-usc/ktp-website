import { prisma } from '@/lib/prisma';
import { requireEmployer } from '@/lib/auth/guards';
import { NextResponse } from 'next/server';
import { type as AccountType } from '@prisma/client';
import { findLocalResumeForStudent } from './localResumes';

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

  const resumes = accounts
    .map((student) => {
      const localResume = findLocalResumeForStudent(student);

      if (!localResume && !student.resumeBlobURL) return null;

      return {
        ...student,
        resumeBlobURL: `/api/employers/resumes/${student.id}`,
      };
    })
    .filter((student): student is NonNullable<typeof student> => Boolean(student));

  return NextResponse.json({ resumes });
}
