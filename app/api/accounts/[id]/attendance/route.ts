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
    const data = await prisma.attendance.create({
      data: {
        eventId: event.id,
        accountId: accountId,
        checkedInAt: new Date(),
      },
    });
    return Response.json(data);
  } catch (error) {
    console.log(error);
  }
}
