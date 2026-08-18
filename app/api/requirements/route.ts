import { prisma } from "@/lib/prisma";
import { PointRequirement } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";
import { memberType } from "@prisma/client";
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

export async function GET(request: NextRequest) {
  const memberType = request.nextUrl.searchParams.get(
    "memberType",
  ) as memberType;

  let result: PointRequirement[];
  if (!memberType) {
    result = await prisma.pointRequirement.findMany();
  } else {
    result = await prisma.pointRequirement.findMany({
      where: {
        OR: [{ memberType: memberType }, { memberType: "ALL_MEMBERS" }],
      },
    });
  }
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
