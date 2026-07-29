import { prisma } from "@/lib/prisma";

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
