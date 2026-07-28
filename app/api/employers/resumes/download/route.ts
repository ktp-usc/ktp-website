
import { prisma } from '@/lib/prisma';
import { requireEmployer } from '@/lib/auth/guards';
import { type as AccountType } from '@prisma/client';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type ZipEntry = {
  filename: string;
  data: Buffer;
};

const CRC_TABLE = new Uint32Array(256);

for (let i = 0; i < CRC_TABLE.length; i += 1) {
  let c = i;

  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }

  CRC_TABLE[i] = c >>> 0;
}

function crc32(data: Buffer) {
  let crc = 0xffffffff;

  for (const byte of data) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date: Date) {
  const year = Math.max(date.getFullYear(), 1980);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = Math.floor(date.getSeconds() / 2);

  return {
    date: ((year - 1980) << 9) | (month << 5) | day,
    time: (hours << 11) | (minutes << 5) | seconds,
  };
}

function sanitizeFilenamePart(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^_+|_+$/g, '') || 'student';
}

function makeResumeFilename(
  student: { firstName: string; lastName: string },
  usedNames: Set<string>,
  extension = '.pdf'
) {
  const baseName = [
    sanitizeFilenamePart(student.lastName),
    sanitizeFilenamePart(student.firstName),
    'Resume',
  ].join('_');

  let filename = `${baseName}${extension}`;
  let count = 2;

  while (usedNames.has(filename)) {
    filename = `${baseName}_${count}${extension}`;
    count += 1;
  }

  usedNames.add(filename);
  return filename;
}

function writeUInt16(value: number) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value, 0);
  return buffer;
}

function writeUInt32(value: number) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value >>> 0, 0);
  return buffer;
}

function buildZip(entries: ZipEntry[]) {
  const now = dosDateTime(new Date());
  const localFileParts: Buffer[] = [];
  const centralDirectoryParts: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const filenameBuffer = Buffer.from(entry.filename, 'utf8');
    const crc = crc32(entry.data);
    const size = entry.data.byteLength;

    const localHeader = Buffer.concat([
      writeUInt32(0x04034b50),
      writeUInt16(20),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt16(now.time),
      writeUInt16(now.date),
      writeUInt32(crc),
      writeUInt32(size),
      writeUInt32(size),
      writeUInt16(filenameBuffer.byteLength),
      writeUInt16(0),
      filenameBuffer,
    ]);

    localFileParts.push(localHeader, entry.data);

    centralDirectoryParts.push(Buffer.concat([
      writeUInt32(0x02014b50),
      writeUInt16(20),
      writeUInt16(20),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt16(now.time),
      writeUInt16(now.date),
      writeUInt32(crc),
      writeUInt32(size),
      writeUInt32(size),
      writeUInt16(filenameBuffer.byteLength),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt32(0),
      writeUInt32(offset),
      filenameBuffer,
    ]));

    offset += localHeader.byteLength + entry.data.byteLength;
  }

  const centralDirectory = Buffer.concat(centralDirectoryParts);
  const endOfCentralDirectory = Buffer.concat([
    writeUInt32(0x06054b50),
    writeUInt16(0),
    writeUInt16(0),
    writeUInt16(entries.length),
    writeUInt16(entries.length),
    writeUInt32(centralDirectory.byteLength),
    writeUInt32(offset),
    writeUInt16(0),
  ]);

  return Buffer.concat([...localFileParts, centralDirectory, endOfCentralDirectory]);
}

async function parseRequestedIds(req: Request): Promise<string[] | null> {
  const body = await req.json().catch(() => null);
  const ids: unknown[] | null = Array.isArray(body?.ids) ? body.ids : null;

  if (!ids) return null;

  return [...new Set(ids.filter((id): id is string => typeof id === 'string' && id.trim().length > 0))];
}

export async function POST(req: Request) {
  const authed = await requireEmployer();
  if ('response' in authed) return authed.response;

  const requestedIds = await parseRequestedIds(req);

  if (requestedIds?.length === 0) {
    return NextResponse.json({ error: 'no_resumes_selected' }, { status: 400 });
  }

  const students = await prisma.accounts.findMany({
    where: {
      type: { in: [AccountType.BROTHER, AccountType.LEADERSHIP] },
      ...(requestedIds ? { id: { in: requestedIds } } : {}),
    },
    select: {
      firstName: true,
      lastName: true,
      resumeBlobURL: true,
    },
    orderBy: [
      { lastName: 'asc' },
      { firstName: 'asc' },
    ],
  });

  if (students.length === 0) {
    return NextResponse.json({ error: 'no_resumes_found' }, { status: 404 });
  }

  const usedNames = new Set<string>();
  const entries: ZipEntry[] = [];
  const failedNames: string[] = [];

  // keep this in step with [id]/route.ts: the uploaded resume is the only source
  for (const student of students) {
    if (!student.resumeBlobURL) continue;

    const filename = makeResumeFilename(student, usedNames, '.pdf');

    try {
      const response = await fetch(student.resumeBlobURL, { cache: 'no-store' });

      if (!response.ok) {
        failedNames.push(filename);
        continue;
      }

      entries.push({
        filename,
        data: Buffer.from(await response.arrayBuffer()),
      });
    } catch {
      failedNames.push(filename);
    }
  }

  if (failedNames.length) {
    entries.push({
      filename: 'download-errors.txt',
      data: Buffer.from(`Unable to download:\n${failedNames.join('\n')}\n`, 'utf8'),
    });
  }

  if (entries.length === 0) {
    return NextResponse.json({ error: 'resume_download_failed' }, { status: 502 });
  }

  const zip = buildZip(entries);

  return new NextResponse(new Uint8Array(zip), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="ktp-resumes.zip"',
      'Content-Length': String(zip.byteLength),
    },
  });
}
