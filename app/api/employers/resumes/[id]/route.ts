
import { prisma } from '@/lib/prisma';
import { requireEmployer } from '@/lib/auth/guards';
import { type as AccountType } from '@prisma/client';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

function contentTypeForFilename(filename: string) {
  return filename.toLowerCase().endsWith('.docx')
    ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    : 'application/pdf';
}

function contentDispositionForFilename(filename: string) {
  const type = filename.toLowerCase().endsWith('.pdf') ? 'inline' : 'attachment';
  return `${type}; filename="${filename.replace(/"/g, '')}"`;
}

function resumeResponse(data: Buffer, filename: string) {
  return new NextResponse(new Uint8Array(data), {
    headers: {
      'Content-Type': contentTypeForFilename(filename),
      'Content-Disposition': contentDispositionForFilename(filename),
      'Content-Length': String(data.byteLength),
    },
  });
}

export async function GET(_: Request, ctx: Ctx) {
  const authed = await requireEmployer();
  if ('response' in authed) return authed.response;

  const { id } = await ctx.params;

  const student = await prisma.accounts.findFirst({
    where: {
      id,
      type: { in: [AccountType.BROTHER, AccountType.LEADERSHIP] },
    },
    select: {
      firstName: true,
      lastName: true,
      resumeBlobURL: true,
    },
  });

  if (!student) {
    return NextResponse.json({ error: 'resume_not_found' }, { status: 404 });
  }

  // The uploaded resume is the only source. Exec removing it clears resumeBlobURL, which
  // both drops the member from the list and makes this 404.
  if (!student.resumeBlobURL) {
    return NextResponse.json({ error: 'resume_not_found' }, { status: 404 });
  }

  const response = await fetch(student.resumeBlobURL, { cache: 'no-store' });

  if (!response.ok) {
    return NextResponse.json({ error: 'resume_download_failed' }, { status: 502 });
  }

  return resumeResponse(
    Buffer.from(await response.arrayBuffer()),
    `${student.lastName}_${student.firstName}_Resume.pdf`
  );
}
