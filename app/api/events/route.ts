import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const event = await prisma.event.create({
    data: {
      ...body,
      attendance: [],
      startDate: new Date(body.startDate),
      attendanceCode: generateAttendanceCode(),
    },
  });
  return NextResponse.json(event);
}

export async function GET(req: Request) {
  const events = await prisma.event.findMany();
  return NextResponse.json(events);
}

function generateAttendanceCode(length = 6) {
  return crypto.randomUUID().replace(/-/g, "").slice(0, length).toUpperCase();
}
