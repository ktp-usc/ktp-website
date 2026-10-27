import { prisma } from "@/lib/prisma";
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

const MEMBER_TYPES: memberType[] = ["ACTIVE", "PNM", "ALL_MEMBERS"];

export async function GET(request: NextRequest) {
  const memberTypeParam = request.nextUrl.searchParams.get("memberType");
  const semester = request.nextUrl.searchParams.get("semester")?.trim() || null;

  if (
    memberTypeParam &&
    !MEMBER_TYPES.includes(memberTypeParam as memberType)
  ) {
    return NextResponse.json({ error: "Invalid member type" }, { status: 400 });
  }

  const selectedType = memberTypeParam as memberType | null;
  const result = await prisma.pointRequirement.findMany({
    where: {
      ...(semester ? { semester } : {}),
      ...(selectedType
        ? { OR: [{ memberType: selectedType }, { memberType: "ALL_MEMBERS" }] }
        : {}),
    },
  });
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
