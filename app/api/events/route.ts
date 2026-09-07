import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  generateAttendanceCode,
  getEventFormErrors,
  parseEventFormBody,
  toEventWriteData,
} from "@/lib/events";

export async function POST(req: Request) {
  try {
    const formData = parseEventFormBody(await req.json());
    const errors = getEventFormErrors(formData);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        ...toEventWriteData(formData),
        attendance: { create: [] },
        attendanceCode: generateAttendanceCode(),
      },
    });
    return NextResponse.json(event);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const events = await prisma.event.findMany();
  return NextResponse.json(events);
}
