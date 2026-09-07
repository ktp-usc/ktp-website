import {
  Prisma,
  type accounts,
  type event,
  type PointRequirement,
  type as AccountType,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Tx = Prisma.TransactionClient;

export async function createAttendanceWithPoints(
  accountId: string,
  eventId: string,
) {
  return prisma.$transaction((tx) =>
    createAttendanceWithPointsInTx(tx, accountId, eventId),
  );
}

export async function deleteAttendanceAndRevokePoints(
  accountId: string,
  eventId: string,
) {
  return prisma.$transaction((tx) =>
    deleteAttendanceAndRevokePointsInTx(tx, accountId, eventId),
  );
}

export async function revokePointsForEventAttendances(tx: Tx, eventId: string) {
  const attendances = await tx.attendance.findMany({
    where: { eventId },
    select: { accountId: true, pointsAwarded: true },
  });

  for (const row of attendances) {
    await decrementAccountPoints(tx, row.accountId, row.pointsAwarded ?? 0);
  }
}

export async function adjustAccountPoints(accountId: string, delta: number) {
  if (!Number.isInteger(delta) || delta === 0) {
    throw new Error("Delta must be a non-zero integer");
  }

  const account = await prisma.accounts.findUnique({
    where: { id: accountId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      pointsAwarded: true,
    },
  });
  if (!account) throw new Error("Account not found");

  if (delta > 0) {
    return prisma.accounts.update({
      where: { id: accountId },
      data: { pointsAwarded: { increment: delta } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        pointsAwarded: true,
      },
    });
  }

  const decrement = Math.min(-delta, account.pointsAwarded);
  if (decrement <= 0) return account;

  return prisma.accounts.update({
    where: { id: accountId },
    data: { pointsAwarded: { decrement } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      pointsAwarded: true,
    },
  });
}

async function createAttendanceWithPointsInTx(
  tx: Tx,
  accountId: string,
  eventId: string,
) {
  const [eventRecord, account] = await Promise.all([
    tx.event.findUnique({ where: { id: eventId } }),
    tx.accounts.findUnique({ where: { id: accountId } }),
  ]);

  if (!eventRecord) throw new Error("Event not found");
  if (!account) throw new Error("Account not found");

  const pointsAwarded = await pointsForNewAttendance(tx, account, eventRecord);

  const attendance = await tx.attendance.create({
    data: {
      accountId,
      eventId,
      checkedInAt: new Date(),
      pointsAwarded,
    },
  });

  await incrementAccountPoints(tx, accountId, pointsAwarded);
  return attendance;
}

async function deleteAttendanceAndRevokePointsInTx(
  tx: Tx,
  accountId: string,
  eventId: string,
) {
  const attendance = await tx.attendance.delete({
    where: { eventId_accountId: { eventId, accountId } },
  });

  await decrementAccountPoints(tx, accountId, attendance.pointsAwarded ?? 0);
  return attendance;
}

async function pointsForNewAttendance(
  tx: Tx,
  account: accounts,
  eventRecord: event,
) {
  const requirement = await resolvePointRequirement(tx, account, eventRecord);
  if (!requirement) return 0;

  const alreadyAwarded = await tx.attendance.aggregate({
    where: {
      accountId: account.id,
      event: { PointRequirement: eventRecord.PointRequirement },
    },
    _sum: { pointsAwarded: true },
  });

  const remaining = requirement.maxPoints - (alreadyAwarded._sum.pointsAwarded ?? 0);
  return Math.max(0, Math.min(requirement.pointsPerCompletion, remaining));
}

async function resolvePointRequirement(
  tx: Tx,
  account: accounts,
  eventRecord: event,
): Promise<PointRequirement | null> {
  const requirements = await tx.pointRequirement.findMany({
    where: { name: eventRecord.PointRequirement },
  });
  if (requirements.length === 0) return null;

  const current = await tx.currentSemester.findFirst();
  const inSemester = current
    ? requirements.filter((requirement) => requirement.semester === current.semester)
    : requirements;
  const pool = inSemester.length > 0 ? inSemester : requirements;

  const specificType = specificRequirementTypeForAccount(account.type);
  return (
    pool.find((requirement) => specificType && requirement.memberType === specificType) ??
    pool.find((requirement) => requirement.memberType === "ALL_MEMBERS") ??
    pool[0]
  );
}

function specificRequirementTypeForAccount(accountType: AccountType | null) {
  if (
    accountType === "BROTHER" ||
    accountType === "LEADERSHIP" ||
    accountType === "CHAIR"
  ) {
    return "ACTIVE" as const;
  }
  if (accountType === "PNM") return "PNM" as const;
  return null;
}

async function incrementAccountPoints(tx: Tx, accountId: string, points: number) {
  if (points <= 0) return;
  await tx.accounts.update({
    where: { id: accountId },
    data: { pointsAwarded: { increment: points } },
  });
}

async function decrementAccountPoints(tx: Tx, accountId: string, points: number) {
  if (points <= 0) return;

  const account = await tx.accounts.findUnique({
    where: { id: accountId },
    select: { pointsAwarded: true },
  });
  const decrement = Math.min(points, account?.pointsAwarded ?? 0);
  if (decrement <= 0) return;

  await tx.accounts.update({
    where: { id: accountId },
    data: { pointsAwarded: { decrement } },
  });
}
