import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const attendance = await prisma.attendance.findMany({
    where: {
      eventId: id,
    },
    include: {
      account: true,
    },
  });

  return Response.json(attendance);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: eventId } = await params;
  const { accountId } = await req.json();

  const newAttendance = await prisma.attendance.create({
    data: { accountId, eventId, checkedInAt: new Date() },
  });
  return Response.json(newAttendance);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: eventId } = await params;
  const { accountId } = await req.json();

  const res = await prisma.attendance.delete({
    where: { eventId_accountId: { eventId, accountId } },
  });
  return Response.json({ res });
}
