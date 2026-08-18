import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const deleted = await prisma.pointRequirement.delete({ where: { id } });
    return NextResponse.json(deleted);
  } catch (error) {
    return NextResponse.json(error);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const body = await req.json();
  const { id } = await params;
  try {
    const {
      memberType,
      semester,
      name,
      description,
      requiredAmount,
      pointsPerCompletion,
      maxPoints,
    } = body;
    const result = await prisma.pointRequirement.update({
      where: {
        id,
      },
      data: {
        memberType,
        semester,
        name,
        description,
        requiredAmount: Number(requiredAmount),
        pointsPerCompletion: Number(pointsPerCompletion),
        maxPoints: Number(maxPoints),
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update requirement" },
      { status: 500 },
    );
  }
}
