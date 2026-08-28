import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { isEligibleForEventAttendance } from "@/lib/events";
import { createAttendanceWithPoints } from "@/lib/points/award";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: accountId } = await params;
    const data = await prisma.attendance.findMany({ where: { accountId } });
    return Response.json(data);
  } catch (error) {
    console.log(error);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: accountId } = await params;
    const { attendanceCode } = await req.json();
    const event = await prisma.event.findFirst({ where: { attendanceCode } });

    if (!event || !event.id) {
      return Response.json({ status: 404, message: "could not find event" });
    }

    const account = await prisma.accounts.findUnique({
      where: { id: accountId },
    });
    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }
    if (!isEligibleForEventAttendance(account.type, event)) {
      return NextResponse.json(
        { error: "Account is not eligible for this event" },
        { status: 403 },
      );
    }

    const data = await createAttendanceWithPoints(accountId, event.id);
    return Response.json(data);
  } catch (error) {
    console.log(error);
  }
}
