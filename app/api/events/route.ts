import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const event = await prisma.event.create({
    data: {
      ...body,
      attendance: [],
      startDate: new Date(body.startDate),
    },
  });
  return NextResponse.json(event);
}

export async function GET(req: Request) {}
