import { prisma } from "@/lib/prisma";

export const MAX_SEMESTER_LENGTH = 40;

export function parseSemesterInput(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const semester = value.trim().replace(/\s+/g, " ");
  if (!semester || semester.length > MAX_SEMESTER_LENGTH) return null;
  return semester;
}

export async function getCurrentSemester() {
  const row = await prisma.currentSemester.findFirst();
  return row?.semester ?? null;
}

export async function setCurrentSemester(semester: string) {
  return prisma.$transaction(async (tx) => {
    await tx.currentSemester.deleteMany();
    return tx.currentSemester.create({ data: { semester } });
  });
}
