import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
//   id                  String     @id @default(uuid()) @db.Uuid
//   memberType          RequirmentType
//   semester            String
//   name                String
//   description         String
//   requiredAmount      Int
//   pointsPerCompletion Int
//   maxPoints           Int
export async function POST(req: Request) {
  const body = await req.json();
  const pointRequirement = await prisma.pointRequirement.create({
    data: body,
  });

  return NextResponse.json(pointRequirement);
}

export async function GET() {
  const result = await prisma.pointRequirement.findMany();

  return NextResponse.json(result);
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
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
        id,
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
