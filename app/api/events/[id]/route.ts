import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body = await req.json();
    const { id } = await params;
    const res = await prisma.event.update({ where: { id }, data: body });
    return NextResponse.json(res);
  } catch (error) {
    console.error(error);
    NextResponse.json(
      { message: "server error could not update event" },
      { status: 500 },
    );
  }
}
