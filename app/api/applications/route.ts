import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { ok, serverError } from "@/lib/http/responses";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const authed = await requireAdmin();
  if ("response" in authed) return authed.response;
  let currentSemester;
  try {
    const res = await prisma.currentSemester.findFirst();
    currentSemester = await res?.semester;
  } catch (error) {
    throw new Error("could not get current semester");
  }

  try {
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q")?.trim() || "";
    const status = searchParams.get("status") || "";
    const flagged = searchParams.get("flagged");
    const current = searchParams.get("current");

    console.log("currentSemester ", currentSemester);

    const where: any = {
      ...(status ? { status } : {}),
      ...(flagged === "true" ? { isFlagged: true } : {}),
      ...(flagged === "false" ? { isFlagged: false } : {}),
      ...(current === "true" ? { semester: currentSemester } : {}),
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.applications.findMany({
        where,
        orderBy: [{ isFlagged: "desc" }, { lastModified: "desc" }],
      }),
      prisma.applications.count({ where }),
    ]);

    return ok({ items, total });
  } catch (e) {
    console.error(e);
    return serverError();
  }
}
