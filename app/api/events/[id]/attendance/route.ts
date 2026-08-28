import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { isEligibleForEventAttendance } from "@/lib/events";
import {
  createAttendanceWithPoints,
  deleteAttendanceAndRevokePoints,
} from "@/lib/points/award";

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

  const [event, account] = await Promise.all([
    prisma.event.findUnique({ where: { id: eventId } }),
    prisma.accounts.findUnique({ where: { id: accountId } }),
  ]);

  if (!event || !account) {
    return NextResponse.json({ error: "Event or account not found" }, { status: 404 });
  }

  if (!isEligibleForEventAttendance(account.type, event)) {
    return NextResponse.json(
      { error: "Account is not eligible for this event" },
      { status: 403 },
    );
  }

  const newAttendance = await createAttendanceWithPoints(accountId, eventId);
  return Response.json(newAttendance);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: eventId } = await params;
  const { accountId } = await req.json();

  const res = await deleteAttendanceAndRevokePoints(accountId, eventId);
  return Response.json({ res });
}
