import { prisma } from "@/lib/prisma";
import { revokePointsForEventAttendances } from "@/lib/points/award";

export async function deleteEventById(id: string) {
  return prisma.$transaction(async (tx) => {
    await revokePointsForEventAttendances(tx, id);
    await tx.attendance.deleteMany({ where: { eventId: id } });
    return tx.event.delete({ where: { id } });
  });
}
